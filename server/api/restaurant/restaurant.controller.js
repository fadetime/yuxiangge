'use strict';

var _ = require('lodash');
var Restaurant = require('./restaurant.model');
var User = require('../user/user.model');
var util = require('../../tool/util');
var config = require('../../tool/config');

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

var createUser = function (user, cb) {
  var newUser = new User(user);
  newUser.provider = 'local';
  newUser.role = 'restaurant';
  newUser.save(cb);
};

//通过一个餐厅对象,获取这个餐厅及连锁的餐厅idArr

exports.getResIdsArr=function(restaurant,cb){
	var error;
	var restaurantIds = [];
	var condition2 = {};
	if(restaurant.superior){
		condition2 = {
			superior:restaurant.superior
		};
		restaurantIds.push(restaurant.superior);
	}else{
		condition2 = {
			superior:restaurant._id
		};
		restaurantIds.push(restaurant._id);
	}
	Restaurant.find(condition2, function (err, restaurants){
		if (err) { 
			error=err;
			return cb(error,restaurantIds);
		}
		_.each(restaurants, function (restaurant){
			restaurantIds.push(restaurant._id);
		});
		return cb(error,restaurantIds);
	});
};

//index
exports.index=function (req,res){
	var language=req.headers.language,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	retrieval=req.query.retrieval;
	var condition={
		role:"restaurant"
	};
	if(retrieval){
		condition=_.merge(condition,{account:{'$regex' : '.*' + retrieval + '.*',"$options":"$i"}});
	}
	var count=0;
	User.find(condition).count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
	});
	User.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.populate("_restaurantProflie")
	.sort({createDate:-1})
	.exec(function (err,users){
		if (err) { return handleError(res, err); }
		res.json(200,{
			users:users,
			page:page,
			count:count
		});
	});
};

//总店餐厅下设分店
exports.createBranch = function(req,res){
	var language=req.headers.language,
		name=req.body.name,
		account=req.body.account,
		password = req.body.password;
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}
	if(!account){
		return res.json(200,util.code301(language,"account"));
	}
	if(!password){
		return res.json(200,util.code301(language,"password"));
	}
	Restaurant.findById(req.user._restaurantProflie,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		if (restaurant.superior){
			return res.json(200,util.code117(language));
		}
		var obj={
			name:name,
			servicePercent : restaurant.servicePercent,
			gstPercent : restaurant.gstPercent,
			ratio : restaurant.ratio,
			address:"",
			tel:"",
			notice:"",
			integralRule:"",
			createDate : new Date(),
			superior:restaurant._id
		};
		var condition = {
			role:'restaurant',
			account:account
		};
		User.findOne(condition,function (err, user){
			if (err) { return handleError(res, err); }
			if(user){
				return res.json(200,util.code111(language,account));
			}
			Restaurant.create(obj,function (err, restaurant){
				if (err) { return handleError(res, err); }
				var obj = {
					account:account,
					password:password,
					_restaurantProflie:restaurant._id
				};
				createUser(obj,function (err, user){
					if (err) { return handleError(res, err); }
					res.json(200,{user:user});
				});
			});
		});
	});
};


exports.create = function (req, res){
	var language=req.headers.language,
		name=req.body.name,
		logo=req.body.logo,
		address=req.body.address,
		tel=req.body.tel,
		account=req.body.account,
		password = req.body.password;
	var servicePercent=req.body.servicePercent,
		gstPercent=req.body.gstPercent,
		ratio=req.body.ratio;
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}
	if(!account){
		return res.json(200,util.code301(language,"account"));
	}
	if(!password){
		return res.json(200,util.code301(language,"password"));
	}
	var obj={
		name:name,
		logo:logo,
		address:address,
		tel:tel,
		servicePercent : config.servicePercent,
		gstPercent : config.gstPercent,
		ratio : config.ratio,
		notice:"",
		integralRule:"",
		nameIndex:1,
		doNumberIndex:0,
		createDate : new Date()
	};
	if(servicePercent){
		if(servicePercent<0 || servicePercent>=1){
			return res.json(200,util.code302(language,"servicePercent"));
		}
		obj.servicePercent = servicePercent;
	}
	if(gstPercent){
		if(gstPercent<0 || gstPercent>=1){
			return res.json(200,util.code302(language,"gstPercent"));
		}
		obj.gstPercent = gstPercent;
	}
	if(ratio){
		if(ratio<0){
			return res.json(200,util.code302(language,"ratio"));
		}
		obj.ratio = ratio;
	}
	var condition = {
		role:'restaurant',
		account:account
	};
	User.findOne(condition,function (err, user){
		if (err) { return handleError(res, err); }
		if(user){
			return res.json(200,util.code111(language,account));
		}
		Restaurant.create(obj,function (err, restaurant){
			if (err) { return handleError(res, err); }
			var obj = {
				account:account,
				password:password,
				_restaurantProflie:restaurant._id
			};
			createUser(obj,function (err, user){
				if (err) { return handleError(res, err); }
				res.json(200,{user:user});
			});
		});
	});
	
};



//获取某个餐厅
exports.show = function (req,res){
	var language=req.headers.language,
		restaurantId = req.params.id;
	Restaurant.findById(restaurantId,function (err, restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		return res.json(200,{restaurant:restaurant});
	});
};

//餐厅更新自己信息
exports.update = function (req,res){
	var language=req.headers.language,
		restaurantId = req.user._restaurantProflie;
	var body=_.pick(req.body,"name","logo","address","tel","servicePercent","gstPercent","notice","integralRule","ratio");
	if(util.isInvalidNum(body.servicePercent)||body.servicePercent>1){
		return res.json(200,util.code402(language,"服务费(servicePercent)"));
	}
	if(util.isInvalidNum(body.gstPercent)||body.gstPercent>1){
		return res.json(200,util.code402(language,"税率(gstPercent)"));
	}
	Restaurant.findById(restaurantId,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		restaurant=_.assign(restaurant,body);
		restaurant.save(function (err,restaurant){
			if (err) { return handleError(res, err); }
			res.json(200,{restaurant:restaurant});
		});
	});
};