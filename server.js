  //Load Application tools
  var express     =    require('express'),
      bodyParser  =    require('body-parser'),
      mongoose    =    require('mongoose'),
      morgan      =    require('morgan');



  var app = express();

// Database
  mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/dater');

  // *** Server Logging ***
  app.use(morgan('dev'));

// Setting Public Folder
  app.use(express.static(__dirname + "/client"));


// Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  // Routes
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
  });

  // app.get('/new', function(req, res){
  //   res.sendFile(__dirname + '/client/new.html');
  // });
  //
  // app.get('/webinar', function(req, res){
  //   res.sendFile(__dirname + '/client/post.html');
  // });


  // *** Routing/Controllers ***
  var UsersController = require('./server/controllers/users');
  app.use('/api/users', UsersController);
  var PostsController = require('./server/controllers/posts');
  app.use('/api/posts', PostsController);


  app.listen(process.env.PORT || 8080, function(){
    console.log('This is a MEAN app');
  });
