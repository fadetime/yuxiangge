'use strict';

var _ = require('lodash');
var Waiter = require('./waiter.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Table = require('../table/table.model');
var util = require('../../tool/util');
var config = require('../../tool/config');

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};

var createUser = function (user, cb) {
  var newUser = new User(user);
  newUser.provider = 'local';
  newUser.role = 'waiter';
  newUser.save(cb);
};

//index
exports.index=function (req,res){
	var language=req.headers.language,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		_restaurant=req.query._restaurant,
		retrieval=req.query.retrieval;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	var count=0;
	var condition={
		_restaurant:_restaurant
	};
	Waiter.find(condition,function (err,waiters){
		if (err) { return handleError(res, err); }
		var waiterIds=[];
		_.each(waiters,function (waiter){
			waiterIds.push(waiter._id);
		});
		var query={
			role:"waiter",
			_waiterProflie:{$in:waiterIds}
		};
		if(retrieval){
			query=_.merge(query,{account:{'$regex' : '.*' + retrieval + '.*',"$options":"$i"}});
		}
		User.find(query).count(function (err,c){
			if (err) { return handleError(res, err); }
			count=c;
		});
		User.find(query,{},{
			skip:itemsPerPage*(page-1),
			limit:itemsPerPage
		})
		.populate("_waiterProflie")
		.sort({createDate:-1})
		.exec(function (err,users){
			if (err) { return handleError(res, err); }
			res.json(200,{
				users:users,
				count:count,
				page:page
			});
		});
	});


	

};

//创建服务员
exports.create=function(req,res){
	var language=req.headers.language,
		name=req.body.name,
		// authPassword=req.body.authPassword,
		account=req.body.account,
		password=req.body.password,
		_restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}
	if(!account){
		return res.json(200,util.code301(language,"account"));
	}
	if(!password){
		return res.json(200,util.code301(language,"password"));
	}
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		User.findOne({account:account},function (err,user){
			if (err) { return handleError(res, err); }
			if (user) {return res.json(200,util.code111(language,account));}
			var condition={
				_restaurant:_restaurant,
				name:name,
				// authPassword:"00000000",
				createDate:new Date()
			};
			// if(authPassword){
			// 	condition.authPassword=authPassword;
			// }
			Waiter.create(condition,function (err,waiter){
				if (err) { return handleError(res, err); }
				var user={
					account:account,
					password:password,
					_waiterProflie:waiter._id
				}
				createUser(user,function (err,user){
					if (err) { return handleError(res, err); }
					res.json(200,{user:user});
				});
			});
		});
	});
	
};

//验证口令
exports.checkAuthPassword = function (req,res){
	var language=req.headers.language,
		authPassword=req.body.authPassword;
	if(!authPassword){
		return res.json(200,util.code501(language,"authPassword"));
	}
	User.findById(req.user._id, function (err, user) {
    // console.log(req.user.role,user.role,user);
   
	    if(user.authenticate(authPassword)) {
	      res.json(200,{user:user});
	    } else {
	      return res.json(200,util.code403(language));
	    }
	    
	    
	});

	// Waiter.findById(req.user._waiterProflie,function (err,waiter){
	// 	if (err) { return handleError(res, err); }
	// 	if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
	// 	if(authPassword!=waiter.authPassword){
	// 		return res.json(200,util.code403(language));
	// 	}
	// 	res.json(200,{waiter:waiter});
	// });
};

//update waiter by id
exports.update = function (req,res){
	var language=req.headers.language,
		id=req.params.id;
	var body=_.pick(req.body,"name","serviceTables","authPassword");

	var checkTableExist=function (tableIds,cb){
		var error;
		Table.find({_id:{$in:tableIds}},function (err,tables){
			if (err) { return handleError(res, err); }
			_.each(tableIds,function (id){
				var findTable;
				for (var i = 0; i < tables.length; i++) {
					if(tables[i]._id==id){
						findTable=tables.slice(i,1);
						i--;
						return
					}
					
				};
				if(!findTable){
					error=util.code404(language,"table:"+id);
					return cb(error);
				}
			});
			cb(error);
		});
	};
	Waiter.findById(id,function (err,waiter){
		if (err) { return handleError(res, err); }
		if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
		if(body.serviceTables){
			body.serviceTables=util.getNoRepeatArr(body.serviceTables);
			checkTableExist(body.serviceTables,function (err){
				if (err){
					return res.json(200,err);
				}
				waiter=_.assign(waiter,body);
				waiter.save(function (err,waiter){
					if (err) { return handleError(res, err); }
					res.json(200,{waiter:waiter});
				});
			});
		}else{
			waiter=_.assign(waiter,body);
			waiter.save(function (err,waiter){
				if (err) { return handleError(res, err); }
				res.json(200,{waiter:waiter});
			});
		}
	});
};

//通过id删除
exports.destroy=function (req,res){
	var language=req.headers.language,
		id=req.params.id;
	Waiter.findById(id,function (err,waiter){
		if (err) { return handleError(res, err); }
		if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
		User.findOne({_waiterProflie:id},function (err,user){
			if (err) { return handleError(res, err); }
			if (!user) {return res.json(200,util.code404(language,"user"));}
			waiter.remove();
			user.remove(function (err){
				if (err) { return handleError(res, err); }
				res.json(200,util.code800(language));
			});
		});
		
	});
};