'use strict';

var _ = require('lodash');
var Integral = require('./integral.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var config = require('../../tool/config');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};

var arrGetShowName=function(integrals,language){
	integrals=util.toObjectArr(integrals);
	if(language=="english"){
		_.each(integrals,function (integral){
			if(integral.gift){
				integral.gift.showName=integral.gift.name_english;
			}
		});
	}else{
		_.each(integrals,function (integral){
			if(integral.gift){
				integral.gift.showName=integral.gift.name;
			}
		});
	}
	return integrals;
};

var signGetShowName=function(integral,language){
	integral=integral.toObject();
	if(language=="english"){
		if(integral.gift){
			integral.gift.showName=integral.gift.name_english;
		}
	}else{
		if(integral.gift){
			integral.gift.showName=integral.gift.name;
		}
	}
	return integral;
};

//customer查询跟积分有关的记录
exports.index=function (req,res){
	var language=req.headers.language,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		_customer=req.query._customer,
		_restaurant=req.query._restaurant,
		isSpend = req.query.isSpend,//不存在为全部，true为消费记录，false为增加记录
		isIncludeBranch = req.query.isIncludeBranch;//是否在所有分店内查询，默认为是，否只在当前店查询
		// isGetReadyDeal=req.query.isGetReadyDeal;//查询还没被处理的用户兑换记录，默认不去查，true只获取state=2还且还未被处理的记录
	// var user=req.user,
	// 	role=user.role;
	// if(role=="customer"){
	// 	_customer=user._customerProflie;
	// }
	// if(role=="restaurant"){
	// 	_restaurant=user._restaurantProflie;
	// }
	if(!_customer){
		return res.json(200,util.code501(language,"_customer"));
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	var resIdArr=[];
	var doQuery=function(){
		var condition={
			_customer:_customer
		};
		if(isSpend=="false"){
			condition=_.merge(condition,{state:{$ne:2}});
		}else if(isSpend=="true"){
			condition=_.merge(condition,{state:2});
		}
		var count=0;
		Integral.find(condition)
		.where("restaurant._restaurant")
		.in(resIdArr)
		.count(function (err,c){
			if (err) { return handleError(res, err); }
			count=c;
		});
		Integral.find(condition,{},{
			skip:itemsPerPage*(page-1),
			limit:itemsPerPage
		})
		.where("restaurant._restaurant")
		.in(resIdArr)
		.sort({createDate:-1})
		.populate('_customer')
		.exec(function (err,integrals){
			if (err) { return handleError(res, err); }
			integrals=arrGetShowName(integrals,language);
			res.json(200,{
				integrals:integrals,
				count:count,
				page:page
			});
		});
	};
	if(isIncludeBranch!="false"){
		Restaurant.findById(_restaurant,function (err,restaurant){
			if (err) { return handleError(res, err); }
			if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
			getResIdsArr(restaurant,function (err,restaurantIds){
				if (err) { return handleError(res, err); }
				resIdArr=restaurantIds;
				doQuery();
			});
		});
	}else{
		resIdArr.push(_restaurant);
		doQuery();
	}
	
};