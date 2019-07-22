'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var Member = require('../member/member.model');
var jwt = require('jsonwebtoken');
var util = require('../../tool/util');
var Restaurant = require('../restaurant/restaurant.model');
var Waiter = require('../waiter/waiter.model');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    // console.log(req.user.role,user.role,user);
   
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
    
    
  });
};

// admin,res change password
exports.forceToChange=function (req,res,next){
  var userId = req.params.id;
  var newPass = String(req.body.newPassword);
  var role = req.user.role;
  User.findById(userId, function (err, user) {
    if (err) return validationError(res, err);
    if(!role){ return res.status(404).send("user not found")}
      if((role=="admin"&&user.role!="admin")||(role=="restaurant"&&(user.role=="waiter"||user.role=="customer"))){
        user.password = newPass;
        user.save(function(err) {
          if (err) return validationError(res, err);
          res.status(200).send('OK');
        });
      }else{
        return res.status(403).send('Forbidden');
      }
      
  });
};


/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var language=req.headers.language;
  var userId = req.user._id;
  var _restaurant = req.query._restaurant;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword')
  .populate("_restaurantProflie _customerProflie _waiterProflie")
  .exec(function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    if(user.role=="customer"&&_restaurant){
      Restaurant.findById(_restaurant,function (err,restaurant){
        if (err) return next(err);
        if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
        getResIdsArr(restaurant,function (err,restaurantIds){
          if (err) return next(err);
          var condition={
            _customer:user._customerProflie._id,
            _restaurant:{$in:restaurantIds}
          };
          Member.findOne(condition,function (err,member){
            if (err) return next(err);
            if (!member) {
              var obj={
                _restaurant:_restaurant,
                createDate:new Date(),
                integral:0,
                _customer:user._customerProflie._id
              };
              Member.create(obj);
              user=user.toObject();
              user.integral=obj.integral;
              res.json(user);
            }else{
              user=user.toObject();
              user.integral=member.integral;
              res.json(user);
            }
            
          });
        });
      });
      
      
    }else if(user.role=="waiter"){
      Waiter.findById(user._waiterProflie,function (err,waiter){
        if (err) return next(err);
        if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
        Restaurant.findById(waiter._restaurant,function (err,restaurant){
          if (err) return next(err);
          if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
          user=user.toObject();
          user._restaurant=waiter._restaurant;
          user.notice=restaurant.notice;
          user.integralRule=restaurant.integralRule;
          user.ratio=restaurant.ratio;
          res.json(user);
        });
      });
    }else{
      res.json(user);
    }
    
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

// customer get info by account
exports.getInfo = function (req,res){
  var language = req.headers.language,
      account = req.query.account;
  var _restaurant = req.query._restaurant;
  if(!account){
    return res.json(200,util.code501(language,"account"));
  }
  if(!_restaurant){
    return res.json(200,util.code501(language,"_restaurant"));
  }
  var condition={
    account:account,
    role:"customer"
  };
  User.findOne(condition)
  .populate("_customerProflie")
  .exec(function (err,user){
    if (err) return next(err);
    if (!user) {return res.json(200,util.code404(language,"user"));}
    Restaurant.findById(_restaurant,function (err,restaurant){
        if (err) return next(err);
        if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
        getResIdsArr(restaurant,function (err,restaurantIds){
          if (err) return next(err);
          condition={
            _customer:user._customerProflie._id,
            _restaurant:{$in:restaurantIds}
          };
          Member.findOne(condition,function (err,member){
            if (err) return next(err);
            if (!member) {
              var obj={
                _restaurant:_restaurant,
                createDate:new Date(),
                integral:0,
                _customer:user._customerProflie._id
              };
              Member.create(obj);
              user=user.toObject();
              user.integral=obj.integral;
              res.json(user);
            }else{
              user=user.toObject();
              user.integral=member.integral;
              res.json(user);
            }
            
          });
        });
      });
  });
};

