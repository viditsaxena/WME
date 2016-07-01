var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
       yourName: {type: String},
       email: {type: String},
       subject: {type: String},
       city: {type: String},
       title: {type: String},
       content: {type: String},
       images: [{secure_url: { type: String }, thumbnail_url: {type: String}}],
       likes: [{type: String}],
       visibility: {type: Boolean, default: false},
       created_at: { type: Date, default: Date.now },
       updated_at: { type: Date, default: Date.now }
});

var Post = mongoose.model('Post', PostSchema);



module.exports = Post;
