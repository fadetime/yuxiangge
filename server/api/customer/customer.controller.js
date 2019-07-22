'use strict';

var _ = require('lodash');
var Customer = require('./customer.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Member = require('../member/member.model');
var util = require('../../tool/util');
var config = require('../../tool/config');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

var createUser = function (user, cb) {
  var newUser = new User(user);
  newUser.provider = 'local';
  newUser.role = 'customer';
  newUser.save(cb);
};

//创建顾客账号
exports.create=function(req,res){
	var language=req.headers.language,
		name=req.body.name,
		account=req.body.account,
		password=req.body.password;
		// _restaurant=req.body._restaurant;
	if(!account){
		return res.json(200,util.code301(language,"account"));
	}
	if(!password){
		return res.json(200,util.code301(language,"password"));
	}
	// if(!_restaurant){
	// 	return res.json(200,util.code301(language,"_restaurant"));
	// }
	if(!util.regexTel(account)){
		return res.json(200,util.code102(language,account));
	}
	User.findOne({account:account},function (err,user){
		if (err) { return handleError(res, err); }
		if (user) {return res.json(200,util.code111(language,account));}
		var obj={
			name:account,
			createDate:new Date()
		};
		if(name){
			obj.name=name;
		}
		Customer.create(obj,function (err,customer){
			if (err) { return handleError(res, err); }
			var user={
				account:account,
				password:password,
				_customerProflie:customer._id
			};
			createUser(user,function (err,user){
				if (err) { return handleError(res, err); }
				res.json(200,{user:user});
			});
		});
	});
	// //检查注册餐厅是否存在，并获取所有分店id
	// Restaurant.findById(_restaurant,function (err,restaurant){
	// 	if (err) { return handleError(res, err); }
	// 	if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
	// 	//判断是否为总店餐厅
	// 	var condition={};
	// 	var resIds=[];
	// 	if(restaurant.superior){
	// 		condition={superior:restaurant.superior};
	// 		resIds.push(restaurant.superior);
	// 	}else{
	// 		condition={superior:restaurant._id};
	// 		resIds.push(restaurant._id);
	// 	}
	// 	//获取所有分店resId
	// 	Restaurant.find(condition,function (err,restaurants){
	// 		if (err) { return handleError(res, err); }
	// 		_.each(restaurants,function (restaurant){
	// 			resIds.push(restaurant._id);
	// 		});
	// 		//判断该店是否存在这个账号,从user中检查
	// 		condition={
	// 			role:"customer",
	// 			account:account,
	// 			_restaurant:{$in:resIds}
	// 		};
			
	// 	});
	// });
};


// 查询所有顾客
exports.index = function (req, res){
	var language=req.headers.language,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	restaurantId = req.query.restaurantId,
    	retrieval=req.query.retrieval,
    	state = req.query.state;//1.所有客户(默认) 2.餐厅所有店面客户 3.该餐厅客户
	var count;
	var condition = {};
	var condition3 = {};

	if(restaurantId){
		if('2' != state){
			state = '3';
		}
	}else{
		state = '1';
	}

	var doQuery = function (){
		if(retrieval){
			condition=_.merge(condition,{account:{'$regex' : '.*' + retrieval + '.*',"$options":"$i"}});
		}
		User.find(condition).count(function (err, c){
			if (err) {return handleError(res, err);}
			count = c;
		});
		User.find(condition,{},{
			skip: (page - 1) * itemsPerPage,
			limit: itemsPerPage
		}).populate('_customerProflie').exec(function (err,users){
			if (err) {return handleError(res, err);}
			return res.json(200, {
		        users: users,
		        count: count,
		        page:page
		      });
		});
	};

	var getResCustomers = function (){
		var customerIds = [];
		Member.find(condition3,function (err, members){
			if (err) { return handleError(res, err); }
			_.each(members,function (member){
				customerIds.push(member._customer);
			});
			condition = {_customerProflie:{$in:customerIds}};
			doQuery();
		});
	};
	switch(state){
		case '1':
			condition = {role:'customer'};
			doQuery();
			break;
		case '2':
			Restaurant.findById(restaurantId, function (err, restaurant){
    			if (err) { return handleError(res, err); }
				if(!restaurant){return res.json(200,util.code404(language,'restaurant'));}
				getResIdsArr(restaurant,function (err,restaurantIds){
					if(err){
						return handleError(res, err);
					}
					console.log('condition3');
					condition3 = {_restaurant:{$in:restaurantIds}};
					getResCustomers();
				});
			});
			
			// Restaurant.findById(restaurantId, function (err, restaurant){
   //  			if (err) { return handleError(res, err); }
			// 	if(!restaurant){return res.json(200,util.code404(language,'restaurant'));}
			// 	var restaurantIds = [];
			// 	var condition2 = {};
			// 	if(restaurant.superior){
			// 		condition2 = {
			// 			superior:restaurant.superior
			// 		};
			// 		restaurantIds.push(restaurant.superior);
			// 	}else{
			// 		condition2 = {
			// 			superior:restaurant._restaurantProfile
			// 		};
			// 		restaurantIds.push(restaurant._restaurantProfile);
			// 	}
			// 	Restaurant.find(condition2, function (err, restaurants){
			// 		if (err) { return handleError(res, err); }
			// 		_.each(restaurants, function (restaurant){
			// 			restaurantIds.push(restaurant._id);
			// 		});
			// 		console.log('condition3');
			// 		condition3 = {_restaurant:{$in:restaurantIds}};
			// 		getResCustomers();
			// 	});
			// });
			break;
		default:
			
			condition3 = {_restaurant:restaurantId};
			getResCustomers();
			break;
	}
}



//查询某个顾客 数据结构发生变化，逻辑有变
exports.show = function (req, res) {
	var language=req.headers.language,
    	customerId = req.params.id;
    if (!customerId){return res.json(200,util.code501(language,'customerId'));}
	User.findOne({_customerProflie:customerId}).populate('_customerProflie').exec(function (err, user){
		if (err) {return handleError(res, err);}
		if (!user){return res.json(200,util.code404(language,'user'));}
		var customer = user._customerProflie.toObject();
		customer.account = user.account;
		return res.json(200, {customer: customer});
	});  
};


// update information of customer
exports.update = function (req, res) {
	var name=req.body.name,
		image=req.body.image,
		id=req.params.id;
	Customer.findById(id,function (err,customer){
		if (err) {return handleError(res, err);}
		if (!customer){return res.json(200,util.code404(language,'customer'));}
		var obj={
			name:name,
			image:image
		};
		customer=_.assign(customer,obj);
		customer.save();
		res.json(200,{customer:customer});
	});

};