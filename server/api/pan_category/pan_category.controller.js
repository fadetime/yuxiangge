'use strict';

var _ = require('lodash');
var Pan_category = require('./pan_category.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var language;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

var checkPanComplete=function(pan){
	var open=true;
	if(!util.strIsValued(pan.name)){
		return open=false;
	}
	if(!util.strIsValued(pan.name_english)){
		return open=false;
	}
	if(util.isInvalidNum(pan.soupTotal)){
		return open=false;
	}
	if(util.isInvalidNum(pan.subtotal)){
		return open=false;
	}
	return open;
};

var arrGetShowName=function(pan_categories){
	pan_categories=util.toObjectArr(pan_categories);
	if(language=="english"){
		_.each(pan_categories,function (pan_category){
			pan_category.showName=pan_category.name_english;
		});
	}else{
		_.each(pan_categories,function (pan_category){
			pan_category.showName=pan_category.name;
		});
	}
	return pan_categories;
};

var signGetShowName=function(pan_category){
	pan_category=pan_category.toObject();
	if(language=="english"){
		pan_category.showName=pan_category.name_english;
	}else{
		pan_category.showName=pan_category.name;
	}
	return pan_category;
};

//创建锅的种类
exports.create=function (req,res){
	language=req.headers.language;
	var name=req.body.name,
		name_english=req.body.name_english,
		image=req.body.image,
		soupTotal=req.body.soupTotal,
		subtotal=req.body.subtotal;
	var _restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}
	if(!name_english){
		return res.json(200,util.code301(language,"name_english"));
	}
	if(!soupTotal){
		return res.json(200,util.code301(language,"soupTotal"));
	}
	if(soupTotal<1){
		return res.json(200,util.code302(language,"soupTotal"));
	}
	if(!subtotal){
		return res.json(200,util.code301(language,"subtotal"));
	}
	if(subtotal<0){
		return res.json(200,util.code302(language,"subtotal"));
	}
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		var obj={
			name:name,
			name_english:name_english,
			soupTotal:soupTotal,
			subtotal:subtotal,
			_restaurant:_restaurant,
			createDate:new Date(),
			isActive:false
		};
		if(image){
			obj = _.merge(obj,{image:image});
		}
		Pan_category.create(obj,function (err,pan_category){
			if (err) { return handleError(res, err); }
			pan_category=signGetShowName(pan_category);
			res.json(200,{pan_category:pan_category});
		});
	});


};

//获取锅的种类
exports.index=function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		_restaurant=req.query._restaurant,
		isActive=req.query.isActive;
	var role=req.user.role;
	if(role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	var count=0;
	var condition={
		_restaurant:_restaurant
	};
	if(isActive=="false"){
		condition=_.merge(condition,{isActive:false});
	}else if(isActive!="all"){
		condition=_.merge(condition,{isActive:true});
	}
	Pan_category.find(condition)
	.count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
	});
	Pan_category.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.sort({createDate:-1})
	.exec(function (err,pan_categories){
		if (err) { return handleError(res, err); }
		pan_categories=arrGetShowName(pan_categories);
		res.json(200,{
			pan_categories:pan_categories,
			count:count,
			page:page
		});
	});
};


//获取锅的某个种类
exports.show = function (req,res){
	language=req.headers.language;
	var pan_categoryId = req.params.id;
	Pan_category.findById(pan_categoryId,function (err, pan_category){
		if (err) { return handleError(res, err); }
		if (!pan_category) {return res.json(200,util.code404(language,"pan_category"));}
		pan_category=signGetShowName(pan_category);
		return res.json(200,{pan_category:pan_category});
	});
};

//update by id 
exports.update = function (req,res){
	language=req.headers.language;
	var pan_categoryId = req.params.id;
	var body=_.pick(req.body,"name","name_english","image","soupTotal","subtotal");
	if(util.isInvalidNum(body.soupTotal)){
		return res.json(200,util.code402(language,"soupTotal"));
	}
	if(util.isInvalidNum(body.subtotal)){
		return res.json(200,util.code402(language,"subtotal"));
	}
	Pan_category.findById(pan_categoryId,function (err,pan_category){
		if (err) { return handleError(res, err); }
		if (!pan_category) {return res.json(200,util.code404(language,"pan_category"));}
		pan_category=_.assign(pan_category,body);
		pan_category.save(function (err,pan_category){
			if (err) { return handleError(res, err); }
			pan_category=signGetShowName(pan_category);
			res.json(200,{pan_category:pan_category});
		});
	});
};

//修改锅状态
exports.changeState = function (req,res){
	language=req.headers.language;
	var id = req.params.id;
	var isActive = req.body.isActive;
	if(!isActive&&isActive!=false){
		return res.json(200,util.code401(language,"isActive"));
	}
	var doUpdate=function(cb){
		Pan_category.findById(id,function (err,pan_category){
			if (err) { return handleError(res, err); }
			if (!pan_category) {return res.json(200,util.code404(language,"pan_category"));}
			pan_category.isActive=isActive;
			cb(pan_category);
			
		});
	};
	if(isActive=="true"||isActive==true){
		doUpdate(function (pan_category){
			if(checkPanComplete(pan_category)){
				pan_category.save(function (err,pan_category){
					if (err) { return handleError(res, err); }
					pan_category=signGetShowName(pan_category);
					res.json(200,{pan_category:pan_category});
				});
			}else{
				return res.json(200,util.code406(language));
			}
			
		});
		
	}else if(isActive=="false"||isActive==false){
		doUpdate(function (pan_category){
			pan_category.save(function (err,pan_category){
				if (err) { return handleError(res, err); }
				pan_category=signGetShowName(pan_category);
				res.json(200,{pan_category:pan_category});
			});
			
		});
	}else{
		return res.json(200,util.code402(language,"isActive"));
	}
};


//通过id删除
exports.destroy=function (req,res){
	language=req.headers.language;
	var	id=req.params.id;
	Pan_category.findByIdAndRemove(id,function (err,pan_category){
		if (err) { return handleError(res, err); }
		if (!pan_category) {return res.json(200,util.code404(language,"pan_category"));}
		res.json(200,util.code800(language));
	});
};