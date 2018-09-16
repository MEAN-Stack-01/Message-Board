// Require the Express Module
var express = require('express');
var mongoose = require('mongoose');
var session = require('express-session')
const flash = require('express-flash');
var validate = require('mongoose-validator');
var moment = require('moment');
// Use native promises
mongoose.Promise = global.Promise;
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');

// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
//Set Static Path
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
app.set('css', __dirname + '/static/stylesheets');
app.set('css', __dirname + '/static/images');


mongoose.connect('mongodb://localhost/messagedb');
const CommentSchema = new mongoose.Schema({
    comment: {type: String, required: [true, "Content cannot be blank"], minlength : [3,"Name must be atleast 3 characters!"], maxlength : [255,"Name must be less than 255 characters!"]},
    commentor:  { type: String, required: [true, "Name cannot be blank"], minlength : [3,"Name must be atleast 3 characters!"],maxlength : [255,"Name must be less than 255 characters!"]}
},{timestamps: true})

const MessageSchema = new mongoose.Schema({
    message: { type: String, required: [true, "Content cannot be blank"], minlength : [3,"Name must be atleast 3 characters!"], maxlength : [255,"Name must be less than 255 characters!"]},
    author : {type: String, required: [true, "Name cannot be blank"], minlength : [3,"Name must be atleast 3 characters!"], maxlength : [255,"Name must be less than 255 characters!"]},
    comments: [CommentSchema]
}, {timestamps: true})

const Comment = mongoose.model('Comment',CommentSchema);
const Message = mongoose.model('Message',MessageSchema);

// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
app.get('/', function(req, res) {
  Message.find({},null, {sort: {createdAt: -1}},function(err,messages){
    if (err) {console.log(err);}
    res.render('index',{msgs: messages});
  });
  console.log('Finding Messages')
});

app.post('/messages', function(req, res) {
    console.log("POST DATA", req.body);
    var msg1 = new Message(req.body);
    msg1.save(function(err){
      if(err){
        for(var key in err.errors){
          console.log(key);
          console.log(err.errors[key].message);
          req.flash(key, err.errors[key].message);
        }
        res.redirect('/');
      }else{
        console.log('Message successfully added to the database!');
        res.redirect('/');
      }
    })
})

app.post('/comments/:msgid', function(req, res) {
    console.log("POST DATA", req.body);
    console.log("The msg id is:", req.params.msgid);
    Comment.create(req.body, function(err,data){
      if(err){
        for(var key in err.errors){
          req.flash(key, err.errors[key].message);
        }
        res.redirect('/');
      }
      else {
        Message.findOneAndUpdate({_id:req.params.msgid},{$push: {comments : data}}, function(err,data){
          if(err){
            for(var key in err.errors){
              req.flash(key, err.errors[key].message);
            }
            res.redirect('/');
          } else {
            console.log('Message successfully updated with the Comment!');
            res.redirect('/');
          }
        })
      }
    })
  })

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
