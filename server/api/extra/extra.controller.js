'use strict';

var _ = require('lodash');
var Extra = require('./extra.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var config = require('../../tool/config');
var language;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

var arrGetShowName=function(extras){
	extras=util.toObjectArr(extras);
	if(language=="english"){
		_.each(extras,function (extra){
			extra.showName=extra.name_english;
			extra.showSpecificat=extra.specificat_english;
		});
	}else{
		_.each(extras,function (extra){
			extra.showName=extra.name;
			extra.showSpecificat=extra.specificat;
		});
	}
	return extras;
};

var signGetShowName=function(extra){
	extra=extra.toObject();
	if(language=="english"){
		extra.showName=extra.name_english;
		extra.showSpecificat=extra.specificat_english;
	}else{
		extra.showName=extra.name;
		extra.showSpecificat=extra.specificat;
	}
	return extra;
};

//检查收费信息是否完整
var checkExtraComplete = function (extra){
	var open=true;
	if(!extra.name||!extra.name_english){
		return open=false;
	}
	// if(!extra.name||!extra.name_english||!extra.specificat||!extra.specificat_english){
	// 	return open=false;
	// }
	if(!extra.price&&extra.price!=0){
		return open=false;
	}
	if(isNaN(extra.price)||extra.price<0){
		return open=false;
	}
	return open;
};

//create a extra
exports.create=function(req,res){
	language=req.headers.language;
	var _restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	var obj=_.pick(req.body,"name","name_english","specificat","specificat_english","price");
	if(util.isInvalidNum(obj.price)){
		return res.json(200,util.code302(language,"price"));
	}
	obj.createDate=new Date();
	obj._restaurant=_restaurant;
	obj.isActive=false;
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		Extra.create(obj,function (err,extra){
			if (err) { return handleError(res, err); }
			extra=signGetShowName(extra);
			res.json(200,{extra:extra});
		});
	});
	
};

//get extra
exports.index = function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	isActive = req.query.isActive,
		_restaurant=req.query._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	var condition={
		isActive:true,
		_restaurant:_restaurant
	};
	if(isActive=="false"){
		condition.isActive=false;
	}else if(isActive=="all"){
		delete condition.isActive;
	}
	var count=0;
	Extra.find(condition).count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
	});
	Extra.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.sort({createDate:-1})
	.exec(function (err,extras){
		if (err) { return handleError(res, err); }
		extras=arrGetShowName(extras);
		res.json(200,{
			extras:extras,
			page:page,
			count:count
		});
	});
};



// get one extra
exports.show = function (req,res){
	language=req.headers.language;
	var extraId = req.params.id;
	Extra.findById(extraId,function (err, extra){
		if (err) { return handleError(res, err); }
		if (!extra) {return res.json(200,util.code404(language,"extra"));}
		extra=signGetShowName(extra);
		return res.json(200,{extra:extra});
	});
};

//update by id 
exports.update = function (req,res){
	language=req.headers.language;
	var extraId = req.params.id;
	var body=_.pick(req.body,"name","name_english","specificat","specificat_english","price");
	if(util.isInvalidNum(body.price)){
		return res.json(200,util.code402(language,"price"));
	}
	Extra.findById(extraId,function (err,extra){
		if (err) { return handleError(res, err); }
		if (!extra) {return res.json(200,util.code404(language,"extra"));}
		extra=_.assign(extra,body);
		extra.save(function (err,extra){
			if (err) { return handleError(res, err); }
			extra=signGetShowName(extra);
			res.json(200,{extra:extra});
		});
	});
};

//change extra isActive
exports.changeState = function (req,res){
	language=req.headers.language;
	var extraId = req.params.id;
	var isActive = req.body.isActive;
	if(!isActive&&isActive!=false){
		return res.json(200,util.code401(language,"isActive"));
	}
	var doUpdate=function(cb){
		Extra.findById(extraId,function (err,extra){
			if (err) { return handleError(res, err); }
			if (!extra) {return res.json(200,util.code404(language,"extra"));}
			extra.isActive=isActive;
			cb(extra);
			
		});
	};
	if(isActive=="true"||isActive==true){
		doUpdate(function (extra){
			if(checkExtraComplete(extra)){
				extra.save(function (err,extra){
					if (err) { return handleError(res, err); }
					extra=signGetShowName(extra);
					res.json(200,{extra:extra});
				});
			}else{
				return res.json(200,util.code406(language));
			}
			
		});
		
	}else if(isActive=="false"||isActive==false){
		doUpdate(function (extra){
			extra.save(function (err,extra){
				if (err) { return handleError(res, err); }
				extra=signGetShowName(extra);
				res.json(200,{extra:extra});
			});
			
		});
	}else{
		return res.json(200,util.code402(language,"isActive"));
	}
}; 

//通过id删除
exports.destroy=function (req,res){
	language=req.headers.language;
	var id=req.params.id;
	Extra.findByIdAndRemove(id,function (err,extra){
		if (err) { return handleError(res, err); }
		if (!extra) {return res.json(200,util.code404(language,"extra"));}
		res.json(200,util.code800(language));
	});
};