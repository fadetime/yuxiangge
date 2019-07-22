'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var util = require('../../tool/util');

var router = express.Router();

router.post('/', function(req, res, next) {
	var language=req.headers.language;
	var edition=req.body.edition;
	var roleArr=[];
	if(!edition){
		return res.json(200,util.code502("","edition"));
	}
	switch(edition){
		case "order":
			roleArr=["waiter","customer"];
			break;
		case "manager":
			roleArr=["waiter","restaurant"];
			break;
		case "web":
			roleArr=["restaurant","admin"];
			break;
		default:
			return res.json(200,util.code502("","edition"));
	}

  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) {
    	return res.status(401).json(error);
    }
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
    var role=user.role;
    // 根据版本判断是否返回
    if(roleArr.indexOf(role)>-1){
    	var token = auth.signToken(user._id, role);
    	res.json({token: token});
    }else{
    	return res.json(401,{message:"This version only allows "+roleArr.toString()+" Login"});
    }

    
  })(req, res, next)
});

module.exports = router;