var             express  = require('express'),
                mongoose = require('mongoose'),
              bodyParser = require('body-parser'),
              morgan     = require('morgan');


var PostsController = express.Router();
var Post = require('../models/post');

// Routes
PostsController.get('/', function(req, res){
  //Find plans where visibility is true
  Post.find({'visibility': true}, function(err, posts){
  res.json(posts);
  });
});
PostsController.get('/private', function(req, res){
  //Find plans where visibility is false
  Post.find({'visibility': false}, function(err, posts){
  res.json(posts);
  });
});

PostsController.get('/:id', function(req, res){
  Post.findOne({_id: req.params.id}, function(err, post){
    res.json(post);
  });
});



PostsController.delete('/:id', function(req, res){
  var id = req.params.id;
  Post.findByIdAndRemove(id, function(){
    res.json({status: 202, message: 'Success'});
  });
});


PostsController.post('/:id/like', function(req, res){
  var id = req.params.id;
  var email = req.body.email;
  Post.findByIdAndUpdate({'_id': id, 'likes': {$ne: email}}, {$push: {likes: email}}, {new: true}, function (err, doc){
    if(doc) {
      res.json({status: 202, message: 'Success'});
    } else {
      res.json({status: 500, message: err});
    }
  });
});

PostsController.post('/', function(req, res){
  var post = new Post(req.body);
  post.save(function(){
    res.json(post);
  });
});

PostsController.post('/search', function(req, res){
  console.log('req');
  console.log(req.body);
    var searchTerm = req.body.searchTerm;
    console.log('searchTerm *******');
    console.log(searchTerm);
    if (!searchTerm) {
        res.send(400);
        return;
    }
    var caseInsensitiveSearchTerm = new RegExp('^' + searchTerm.toLowerCase(), 'i');
    Post.find()
        .or(
            [{
                title: {
                    $regex: caseInsensitiveSearchTerm
                }
            }, {
                city: {
                    $regex: caseInsensitiveSearchTerm
                }
            }]
        )
        .exec(function(err, docs) {
            if (!err && docs) {
                res.json(200, {
                    docs: docs
                });
            } else if (!docs) {
                res.send(404);
            } else {
                res.json(500, {
                    message: err
                });
            }
        });
});

//This will be the case when Admin edits the post may be or changes the the flag to public.
PostsController.post('/:id', function(req, res){
  Post.findByIdAndUpdate(req.params.id, {$set: {visibility: true}}, {new: true}, function(err, updatedPost){
    res.json(updatedPost);
  });
});


module.exports = PostsController;
