const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

var Schema=mongoose.Schema;

var UserSchema = new Schema({
  name:{
    type: String,
    // lowercase: true,
    required: true,
    trim:true,
    minlength:1,
    // validate:{
    //   validator: validator.isAlpha
    // }
  },
  email: {
    type:String,
    lowercase: true,
    required: true,
    trim:true,
    minlength:1,
    validate:{
      validator: validator.isEmail
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// below codes are being used to create Instance Methods
// the instance Methods have access to all the documents

// Steps Involved:
// 1. Fetches the Info
// 2. Generates token
// 3. Save the data again and returns token
// 4. The token is then sent as header to client
UserSchema.methods.generateAuthToken=function () {
  var user=this; // get user in a readable variable format
  var access='auth';  // initialize access variable
  // data is a object containing id of user which obviosly is unique
  var data={
    _id:user._id,
    access
  };

  var token=jwt.sign(data, 'someSalt'); // generation of token

  user.tokens.push({access,token}); // modify content of user

  return user.save().then(()=>{
    return token; // return token if the user is saved
  });// return the token whenever the method is called
};

//Object Methods
UserSchema.statics.findByToken=function (token) {
  var user=this;
  var decoded;
  try {
      decoded=jwt.verify(token,'someSalt'); // return decoded token in the token variable
  } catch (e) {
    // we will return Reject of a Promise which will be treated as an Error in the index.js
    return Promise.reject();
  }

  return User.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

UserSchema.pre('save',function (next) {
  var user=this;

  /*
  isModified checks if the password was modified earlier
  it stops us from re-hashing our hashed password
  */
  if(user.isModified('password') ){
    bcryptjs.genSalt(10,(err, salt)=>{
      bcryptjs.hash(user.password,salt,(err,hash)=>{
        user.password=hash;
        next();
      });
    });
  }
  else{
    next();
  }
});

var User=mongoose.model('User',UserSchema);

module.exports = {User};
