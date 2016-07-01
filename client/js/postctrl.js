var postCtrl = angular.module('postCtrl', []);

postCtrl.controller('postController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$window',
function($scope, $rootScope, $http, $cookies, $location, $window){

  $scope.postsSelectedForComments = [];
  $scope.postsSelectedForComments = $cookies.getObject('post');
  console.log('in show');
  console.log($scope.postsSelectedForComments);
  $scope.disqusConfig = {
    disqus_shortname: 'worstmatchever',
    disqus_identifier: $rootScope.showPost._id,
    disqus_url: $window.location.href
  };
}]);
