const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var  UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
      unique: true,
      validate: {
        validator: (value) =>{
          return validator.isEmail(value);
        },
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      require:true,
      minlength:6
    },
    tokens: [{
      access: {
        type:String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }]
  });

  UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject,['_id','email']);
  };

  UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(()=>{
      return token;
    });
  };
// {
//   email: 'alex@example.com',
//   password: 'myPass123',
//   tokens:[{
//     access:'auth',
//     token:'psdfsd'
//   }]
// }

  UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    // jwt.verify()
    try {
        decoded = jwt.verify(token, 'abc123');
    }catch(e){
      // return new Promise((resolve, reject)=>{
      //   reject();
      // });
      return Promise.reject();
    }

    return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    })

  };
var User = mongoose.model('User', UserSchema);


module.exports = {User}
