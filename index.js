const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v1');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const validator = require('validator');
const {mongoose} = require('./db/mongoose'); // connection made to mongodb
const {User} = require('./db/schema/schema');
const {authenticate} = require('./middleware/authenticate');

var app=express();
var status=200;

app.use(bodyParser.json());
// app.use(verify);
app.post('/signup',(req,res)=>{
  var user = new User(req.body);

  user.save().then(()=>{
    return user.generateAuthToken();
  }).then((token)=>{
    res.header('x-auth',token).send(user);
  }).catch((err)=>{
    res.status(400).send(err);
  });

});


app.get('/login',authenticate,(req,res)=>{
  res.send(req.user);
});

function verify(req,res,next){
  req.body=_.pick(req.body,['name','email','pass']);
  if(typeof(req.body.name)=='undefined'){
      status=400;
  }
  else if(!validator.isAlphanumeric(req.body.name) || validator.isEmpty(req.body.name, {ignore_whitespace : true})){
    status=400;
  }

  if(typeof(req.body.email)=='undefined'){
      status=400;
  }
  else if(!validator.isEmail(req.body.name)){
    status=400;
  }

  if(typeof(req.body.pass)=='undefined'){
      status=400;
  }
  else if(!validator.isAlphanumeric(req.body.name) || validator.isEmpty(req.body.pass, {ignore_whitespace : true})){
    status=400;
  }

  if(status == 400){
    res.status(400).send({
      message: 'Incorrect Input'
    });
  }
  else{
    req.body.r_ID=uuid();
    next();
  }
}

app.listen(3000);
