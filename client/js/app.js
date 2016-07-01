  console.log('app.js is loaded');



var postApp = angular.module('postApp', ['ngCookies', 'postCtrl', 'ngRoute', 'ngMessages', 'angularUtils.directives.dirDisqus', 'ui.bootstrap'],
['$locationProvider', function ($locationProvider) {
   // $locationProvider.hashPrefix('!');
		// $locationProvider.html5Mode({
    //   enabled: true,
    //   requireBase: false
    // });
		// $locationProvider.hashPrefix('!');

	}]);
postApp.config(function($routeProvider){

    $routeProvider

    .when('/', {
      templateUrl: './home.html',
      controller: 'mainController'
    })
    .when('/admin-signup', {
      templateUrl: './signup.html',
      controller: 'mainController'
    })
    .when('/admin-login', {
      templateUrl: './login.html',
      controller: 'mainController'
    })
    .when('/create', {
      templateUrl: './create.html',
      controller: 'mainController'
    })
    .when('/posts', {
      templateUrl: './posts.html',
      controller: 'mainController'
    })
    .when('/private-posts', {
      templateUrl: './private-posts.html',
      controller: 'mainController'
    })
    .when('/show', {
      templateUrl: './show.html',
      controller: 'postController'
    })
});

postApp.controller('mainController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$window', '$timeout', '$route', function($scope, $rootScope, $http, $cookies, $location, $window, $timeout, $route){

  $scope.welcomeMessage = '';
  $scope.users = [];
  $scope.searchQuery = "";
  $scope.orderByField = 'name';
  $scope.newUser = {};
  $scope.logInUser = {};
  $scope.posts = [];
  $rootScope.likedPosts = [];
  $scope.privatePosts = [];
  $scope.newPost = {};
  $rootScope.showPost = $cookies.getObject('post');
  $scope.isDisabled = false;
  $rootScope.token;
  $scope.showSearchTerm = false;
  $scope.searchResultsClicked = false;
  $scope.imageUploadedSuccessfully = false;
  $scope.myInterval = 5000;

  $scope.goHome = function () {
    $location.path('/').search('');
    $route.reload();
    $scope.showSearchTerm = false;
  };

  $scope.goToPostCreate = function () {
    $location.path('/create');
    $route.reload();
    $scope.showSearchTerm = false;
  };


  // ============== Users ================

  $scope.getUsers = function(){
    $http.get('/api/users').then(function(response){
      $scope.users = response.data;
    });
  };
  $scope.getUsers();

  $scope.createUser = function(){
    $http.post('/api/users', $scope.newUser).then(function(response){
      $scope.users.push(response.data);
      $scope.instantLogin();
    });
  };
  $scope.instantLogin = function(){
    $http.post("/api/users/authentication_token", $scope.newUser).then(function(reponse){
      $rootScope.token = reponse.data.token;
      $cookies.put('token', $rootScope.token);
      $scope.newUser = {};
      $location.path('/')
    });
  };

  $scope.obtainToken = function(){
    $http.post("/api/users/authentication_token", $scope.logInUser).then(function(reponse){
      $rootScope.token = reponse.data.token;
      $cookies.put('token', $rootScope.token);
      $location.path('/private-posts')
    });
  };

  $scope.logOut = function(){
    $cookies.remove('token');
    $rootScope.token = $cookies.get('token');
    $scope.logInUser = {};
    $location.path('/')
  };

  $rootScope.token = $cookies.get('token');


  $scope.getPrivatePosts = function(){
    $http.get('/api/posts/private').then(function(response){
      $scope.privatePosts = response.data;
      });
  };

  $scope.addPost = function(){
    $http({
      url: '/api/posts',
      method: 'post',
      data: $scope.newPost
    }).then(function(response){
      $scope.goHome();
      $scope.getPosts();
      $scope.newPost = {};
    });
  };
  $scope.getOnePost = function(post){
    $scope.posts = [];
    $cookies.remove('post');
    var url = '/api/posts/' + post._id;

    $http.get(url).then(function(response){
      //$rootScope.showPost = response.data;
      $scope.posts = response.data;
      $cookies.putObject('post', $scope.posts);
      $location.path('/show');
      });
  };




  $scope.removePost = function(post){
        var url = '/api/posts/' + post._id;
        $http.delete(url).then(function(){
        $scope.getPosts();
        });
    };
  $scope.makePostPublic = function(post){
    $scope.updatePost(post);
  }

  $scope.updatePost = function(post){
      var url = '/api/posts/' + post._id;
      $http.post(url, post).then(function(response){
        console.log(response);
        $route.reload();
      });
  };

  $scope.widgetOpen = function(){
    cloudinary.openUploadWidget({ cloud_name: 'worstmatchever', upload_preset: 'elqangqb'},
      function(error, result) { 
        $scope.images = [];
        $scope.newPost.images = [];
        if(result) {
          //$scope.imageUploadedSuccessfully = true;
          $timeout(function () {
          $scope.imageUploadedSuccessfully = true;
          }, 3000);
        }
        for(var i=0;i<result.length; i++) {
          
          $scope.newPost.images.push({'secure_url': result[i].secure_url, 'thumbnail_url': result[i].thumbnail_url});
        }
      }
    );  
  };

  $scope.disableButton = function(post, item) {
           $scope.isDisabled = true;
           item.votes = parseInt(item.votes) + 1;
           $scope.updatePost(post);
       };

  $scope.searchItem = function (text) {
    if(text.length>0) {
      $scope.showSearchTerm = true;
      return $http({
        url: '/api/posts/search',
        method: 'post',
        data: {'searchTerm': text}
      }).then(function(response){
        $scope.posts = [];
        $scope.posts = response.data.docs;
        return response.data.docs.map(function(doc){
          var res = doc.title + '- ' + doc.city;
          return res;
        });
      });
    } else {
      $scope.getPosts();
      $scope.showSearchTerm = false;
    }
  };

  $scope.searchResults = function (val) {
    var itemToSearch = val.split('-')[0];
    $scope.searchResultsClicked = true;
    $scope.searchTerm = val;
    $scope.searchItem(itemToSearch);
    localStorage.setItem('searchResult', itemToSearch);
  };

  $scope.searchCity = function (val) {
    var itemToSearch = val;
    localStorage.setItem('searchResult', itemToSearch);
    $http({
        url: '/api/posts/search',
        method: 'post',
        data: {'searchTerm': val}
      }).then(function(response){
        $scope.posts = [];
        $scope.posts = response.data.docs;
        $location.path('/').search('city', val);
    });
  };

  $scope.like = function (post) {
    var countOfDissimilarLikes = 0;
    $rootScope.likedPosts = JSON.parse(localStorage.getItem('likedPost'));
    if(!$rootScope.likedPosts) {
      $rootScope.likedPosts = [];
      $rootScope.likedPosts.push(post);
      localStorage.setItem('likedPost', JSON.stringify($rootScope.likedPosts));
      $http({
        url: '/api/posts/' + post._id + '/like',
        method: 'post',
        data: {'email': post.email}
      }).then(function(response){
        $scope.getPosts();
      });
    } else {
      for(var i=0; i<$rootScope.likedPosts.length; i++) {
        if($rootScope.likedPosts[i]._id === post._id) {
          break;
        } else {
          countOfDissimilarLikes ++;
          if(countOfDissimilarLikes === $rootScope.likedPosts.length) {
            $rootScope.likedPosts.push(post);
            localStorage.setItem('likedPost', JSON.stringify($rootScope.likedPosts));
            $http({
              url: '/api/posts/' + post._id + '/like',
              method: 'post',
              data: {'email': post.email}
            }).then(function(response){
              $scope.getPosts();
            });
          }
        }
      }
    }
  };

  var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 30,
        loop: true
    });

   $scope.getPosts = function(){
    if($location.search().city) {
      var item = $location.search().city;
      $scope.searchCity(item);
    } else {
    $http.get('/api/posts').then(function(response){
      $scope.posts = response.data;
      $scope.slides = $scope.posts.images;
      });
    }
  };
  $scope.getPosts();

}]);
