'use strict';

var _ = require('lodash');
var Gift = require('./gift.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Member = require('../member/member.model');
var Integral = require('../integral/integral.model');
var util = require('../../tool/util');
var config = require('../../tool/config');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};

var arrGetShowName=function(gifts,language){
	gifts=util.toObjectArr(gifts);
	if(language=="english"){
		_.each(gifts,function (gift){
			gift.showName=gift.name_english;
		});
	}else{
		_.each(gifts,function (gift){
			gift.showName=gift.name;
		});
	}
	return gifts;
};

var signGetShowName=function(gift,language){
	gift=gift.toObject();
	if(language=="english"){
		gift.showName=gift.name_english;
	}else{
		gift.showName=gift.name;
	}
	return gift;
};

//检查礼品信息是否完整
var checkGift = function (gift){
	var open=true;
	if(!util.strIsValued(gift.name)||!util.strIsValued(gift.name_english)){
		return open=false;
	}
	if(!gift.integralPrice&&gift.integralPrice!=0){
		return open=false;
	}
	if(isNaN(gift.integralPrice)||gift.integralPrice<0){
		return open=false;
	}
	if(!gift.quantity&&gift.quantity!=0){
		return open=false;
	}
	if(isNaN(gift.quantity)||gift.quantity<0){
		return open=false;
	}
	return open;
};


//获取兑换礼品，已上架，并且数量大于0
//integral,积分
//isEnough,是否只获取能换的礼品,true=是，false=全部符合条件,默认为false
//isActive,是否上架，admin,res用，默认为全部,
exports.index = function (req,res){
	var language=req.headers.language,
		role = req.user.role,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	_restaurant=req.query._restaurant,
		integral=req.query.integral,
		isActive=req.query.isActive,
		isEnough=req.query.isEnough;

	if(role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
	}

	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	var condition={
		_restaurant:_restaurant
	};
	if(role=="waiter"){
		condition=_.merge(condition,{
			isActive:true,
			quantity:{$gte:1}
		});
		if((integral||integral==0)&&isEnough=="true"){
			condition=_.merge(condition,{
				integralPrice:{$lte:integral}
			});
		}
	}else{
		if(isActive=="true"||isActive=="false"){
			condition=_.merge(condition,{isActive:isActive});
		}
		// if(integral){
		// 	condition=_.merge(condition,{
		// 		integralPrice:{$gte:integral}
		// 	});
		// }
	}
	var count=0;
	Gift.find(condition).count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
	});
	Gift.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.sort({createDate:-1})
	.exec(function (err,gifts){
		if (err) { return handleError(res, err); }
		gifts=arrGetShowName(gifts,language);
		res.json(200,{
			gifts:gifts,
			page:page,
			count:count
		});
	});
	
};

//创建兑换礼品
exports.create=function (req,res){
	var language=req.headers.language,
		name=req.body.name,
		name_english=req.body.name_english,
		quantity=req.body.quantity,
		integralPrice=req.body.integralPrice;
	var _restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
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
	if(!quantity){
		return res.json(200,util.code301(language,"quantity"));
	}
	if(!integralPrice){
		return res.json(200,util.code301(language,"integralPrice"));
	}
	
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		var obj=_.pick(req.body,"name","name_english","quantity","quantity","integralPrice","image","isActive");
		obj.createDate=new Date();
		obj._restaurant=_restaurant;
		if(obj.isActive!="true"){
			obj.isActive=false;
		}
		Gift.create(obj,function (err,gift){
			if (err) { return handleError(res, err); }
			gift=signGetShowName(gift,language);
			res.json(200,{gift:gift});
		});
	});
};

//礼品兑换,一次只能换一个
exports.exchange=function (req,res){
	var language=req.headers.language,
		_gift=req.body._gift,
		user=req.user;
	if(!_gift){
		return res.json(200,util.code301(language,"_gift"));
	}
	var condition={
		_id:_gift,
		quantity:{$gte:1},
		isActive:true
	};
	Gift.findOne(condition)
	.populate("_restaurant")
	.exec(function (err,gift){
		if (err) { return handleError(res, err); }
		if (!gift) {return res.json(200,util.code404(language));}
		gift.quantity--;
		gift.save();
		getResIdsArr(gift._restaurant,function (err,restaurantIds){
			if(err){
				gift.quantity++;
				gift.save();
				return handleError(res, err);
			}
			condition={
				_customer:user._customerProflie,
				_restaurant:{$in:restaurantIds}
			};
			Member.findOne(condition,function (err,member){
				if (err) { return handleError(res, err); }
				if (!member) {
					gift.quantity++;
					gift.save();
					return res.json(200,util.code115(language));
				}
				if(member.integral<gift.integralPrice){
					gift.quantity++;
					gift.save();
					return res.json(200,util.code116(language));
				}
				member.integral=util.dealNumber((member.integral*100-gift.integralPrice*100)/100);
				
				member.save();
				var integral={
					_customer:user._customerProflie,
					integral:gift.integralPrice,
					restaurant:{
						_restaurant:gift._restaurant._id,
						name:gift._restaurant.name
					},
					gift:{
						_gift:gift._id,
						name:gift.name,
						name_english:gift.name_english
					},
					finalIntegral:member.integral,
					createDate:new Date(),
					state:2
				};
				Integral.create(integral,function (err,integral){
					if (err) { return handleError(res, err); }
					res.json(200,{integral:integral});
				});
				
			});
		});

		
	});
};

//get one gift
exports.show = function (req,res){
	var language=req.headers.language,
		giftId = req.params.id;
	Gift.findById(giftId,function (err, gift){
		if (err) { return handleError(res, err); }
		if (!gift) {return res.json(200,util.code404(language,"gift"));}
		gift=signGetShowName(gift,language);
		return res.json(200,{gift:gift});
	});
};

//update sign gift
exports.update = function (req,res){
	var language=req.headers.language,
		giftId = req.params.id,
		name = req.body.name,
		name_english = req.body.name_english,
		quantity = req.body.quantity,
		integralPrice = req.body.integralPrice,
		image = req.body.image;
	var body=_.pick(req.body,"name","name_english","integralPrice","image","quantity");
	if(util.isInvalidNum(body.integralPrice)){
		return res.json(200,util.code402(language,"integralPrice"));
	}
	if(util.isInvalidNum(body.quantity)){
		return res.json(200,util.code402(language,"quantity"));
	}
	Gift.findById(giftId,function (err,gift){
		if (err) { return handleError(res, err); }
		if (!gift) {return res.json(200,util.code404(language,"gift"));}
		gift=_.assign(gift,body);
		gift.save(function (err,gift){
			if (err) { return handleError(res, err); }
			gift=signGetShowName(gift,language);
			res.json(200,{gift:gift});
		});
	});
};

//change gift isActive
exports.changeState = function (req,res){
	var language=req.headers.language,
		giftId = req.params.id;
	var isActive = req.body.isActive;
	if(!isActive&&isActive){
		return res.json(200,util.code401(language,"isActive"));
	}
	var doUpdate=function(cb){
		Gift.findById(giftId,function (err,gift){
			if (err) { return handleError(res, err); }
			if (!gift) {return res.json(200,util.code404(language,"gift"));}
			gift.isActive=isActive;
			cb(gift);
			
		});
	};
	if(isActive==true){
		doUpdate(function (gift){
			if(checkGift(gift)){
				gift.save(function (err,gift){
					if (err) { return handleError(res, err); }
					gift=signGetShowName(gift,language);
					res.json(200,{gift:gift});
				});
			}else{
				return res.json(200,util.code406(language));
			}
			
		});
		
	}else if(isActive==false){
		doUpdate(function (gift){
			gift.save(function (err,gift){
				if (err) { return handleError(res, err); }
				gift=signGetShowName(gift,language);
				res.json(200,{gift:gift});
			});
			
		});
	}else{
		return res.json(200,util.code402(language,"isActive"));
	}
}; 



//通过id删除
exports.destroy=function (req,res){
	var language=req.headers.language,
		id=req.params.id;
	Gift.findById(id,function (err,gift){
		if (err) { return handleError(res, err); }
		if (!gift) {return res.json(200,util.code404(language,"gift"));}
		gift.remove(function (err){
			if (err) { return handleError(res, err); }
			res.json(200,util.code800(language));
		});
		
	});
};