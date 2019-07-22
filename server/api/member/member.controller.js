'use strict';

var _ = require('lodash');
var Member = require('./member.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Customer = require('../customer/customer.model');
var Integral = require('../integral/integral.model');
var util = require('../../tool/util');
var config = require('../../tool/config');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}


//test createMember
// exports.create=function(req,res){
// 	var language=req.headers.language,
// 		_customer=req.body._customer,
// 		_restaurant=req.body._restaurant;
// 	var obj={
// 		_customer:_customer,
// 		_restaurant:_restaurant,
// 		createDate:new Date()
// 	};
// 	Member.create(obj,function (err,member){
// 		if (err) { return handleError(res, err); }
// 		res.json(200,{member:member});
// 	});
// };



//查询所有用户
exports.index = function (req, res){
	var language=req.headers.language,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	restaurantId = req.user._restaurantProflie,
    	sortBy = req.query.sortBy,//integral,按integral从高到低
    	retrieval = req.query.retrieval,//检索账号
    	state = req.query.state;//1.餐厅所有店面客户 2.该餐厅客户(默认)
    var count;
    var condition2
    var getCus = function (){
    	var sort={"createDate":-1};
    	if(sortBy=="integral"){
    		sort={"integral":-1}
    	}
    	var query=function(){
    		Member.find(condition2).count(function (err, c){
				if (err) {return handleError(res, err);}
				count = c;
			});
			Member.find(condition2,{},{
				skip: (page - 1) * itemsPerPage,
				limit: itemsPerPage
			})
			.sort(sort)
			.populate('_customer').exec(function (err, members){
				if (err) { return handleError(res, err); }
				var customerIds = [];
				_.each(members,function (member){
					customerIds.push(member._customer._id);
				});
				User.find({_customerProflie:{$in:customerIds}},function (err, users){
					if (err) { return handleError(res, err); }
					var customers = [];
					_.each(members,function (member){
						var customer = member._customer.toObject();
						for(var i=0;i<users.length;i++){
							if(member._customer._id == users[i]._customerProflie){
								customer.account = users[i].account;
								users.slice(i,1);
								break;
							}
						}
						customer.integral = member.integral;
						customers.push(customer);
						// console.log(member);
					});
					return res.json(200,{
						customers:customers,
						count: count,
				        page:page,
				        itemsPerPage:itemsPerPage
					});
				});
				
			});
    	};

    	if(retrieval){
    		var con={
    			role:"customer",
    			account:{'$regex' : '.*' + retrieval + '.*',"$options":"$i"}
    		};
    		User.find(con,function (err,users){
    			if (err) { return handleError(res, err); }
    			var customerIds=[];
    			_.each(users,function (user){
    				customerIds.push(user._customerProflie);
    			});
    			condition2=_.merge(condition2,{_customer:{$in:customerIds}});
    			query();
    		});
    	}else{
    		query();
    	}
    	
    };
    switch(state){
    	case '1':
    		Restaurant.findById(restaurantId, function (err, restaurant){
				if (err) { return handleError(res, err); }
				if(!restaurant){return res.json(200,util.code404(language,'restaurant'));}
				getResIdsArr(restaurant,function (err,restaurantIds){
					if (err) { return handleError(res, err); }
					condition2 = {_restaurant:{$in:restaurantIds}};
					getCus();
				});
				
			});
    		break;
    	default:
    		condition2 = {_restaurant:restaurantId};
	    	getCus();
    		break;
    };
};


//查询某个用户
exports.show = function (req, res){
	var language=req.headers.language,
		_customer = req.params.id,
    	restaurantId = req.user._restaurantProflie;

	Restaurant.findById(restaurantId, function (err, restaurant){
		if (err) { return handleError(res, err); }
		if(!restaurant){return res.json(200,util.code404(language,'restaurant'));}
		getResIdsArr(restaurant,function (err,restaurantIds){
			if (err) { return handleError(res, err); }
			var condition={
				_customer:_customer,
				_restaurant:{$in:restaurantIds}
			};
			Member.findOne(condition).populate('_customer').exec(function (err, member){
				if (err) { return handleError(res, err); }
				if(!member){return res.json(200,util.code404(language,'member'));}			
				var customer = member._customer.toObject();
				customer.integral = member.integral;
				return res.json(200, {customer:member._customer});
				
			});
		});
		// var restaurantIds = [];
		// var condition = {};
		// if(restaurant.superior){
		// 	condition = {
		// 		superior:restaurant.superior
		// 	};
		// 	restaurantIds.push(restaurant.superior);
		// }else{
		// 	condition = {
		// 		superior:restaurant._id
		// 	};
		// 	restaurantIds.push(restaurant._id);
		// }
		// Restaurant.find(condition, function (err, restaurants){
		// 	if (err) { return handleError(res, err); }
		// 	_.each(restaurants, function (err, restaurant){
		// 		if (err) { return handleError(res, err); }
		// 		restaurantIds.push(restaurant._id);
		// 	});
		// 	Member.findOne({_customer:_customer}).populate('_customer').exec(function (err, member){
		// 		if (err) { return handleError(res, err); }
		// 		if(!member){return res.json(200,util.code404(language,'member'));}
		// 		var index = restaurantId.indexOf(member._restaurant);
		// 		console.log('index');
		// 		console.log(index);
		// 		if(index<0){
		// 			return res.json(200,util.code404(language,'member'));
		// 		}else{
		// 			var customer = member._customer;
		// 			customer.integral = member.integral;
		// 			return res.json(200, {customer:member._customer});
		// 		}
		// 	});
		// });
	});
};


//customer update info
//res,admin add intergal
exports.update = function (req,res){
	var language=req.headers.language,
		_customer = req.body._customer,
		_restaurant=req.user._restaurantProflie,
		integral=req.body.integral;
	if(!_customer){
		return res.json(200,util.code401(language,"_customer"));
	}
	if(!integral){
		return res.json(200,util.code401(language,"integral"));
	}
	if(isNaN(integral)||parseInt(integral)<=0){
		return res.json(200,util.code402(language,"integral"));
	}
	var condition={
		_customer:_customer
	};

	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if(!restaurant){return res.json(200,util.code404(language,'restaurant'));}
		getResIdsArr(restaurant,function (err,restaurantIds){
			if (err) { return handleError(res, err); }
			condition=_.merge(condition,{_restaurant:{$in:restaurantIds}});
			Member.findOne(condition)
			.exec(function (err,member){
				if (err) { return handleError(res, err); }
				if(!member){return res.json(200,util.code404(language,'member'));}
				member.integral=util.dealNumber((member.integral*100+parseInt(integral)*100)/100);
				member.save();
				var integralObj={
					_customer:_customer,
					integral:integral,
					restaurant:{
						_restaurant:restaurant._id,
						name:restaurant.name
					},
					finalIntegral:member.integral,
					state:3,
					createDate:new Date()
				};
				Integral.create(integralObj);
				res.json(200,{member:member});
			});
		});
	});
};
