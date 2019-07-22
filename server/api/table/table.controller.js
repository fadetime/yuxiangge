'use strict';

var _ = require('lodash');
var Table = require('./table.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Waiter = require('../waiter/waiter.model');
var util = require('../../tool/util');
var config = require('../../tool/config');

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

//创建桌
exports.create=function(req,res){
	var language=req.headers.language,
		name=req.body.name,
		remark=req.body.remark;
	var _restaurant=req.user._restaurantProflie;
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}
	var condition={
		name:name,
		_restaurant:_restaurant,
	};
	Table.findOne(condition,function (err, table){
		if (err) { return handleError(res, err); }
		if (table) {return res.json(200,util.code111(language,name));}
		var obj={
			name:name,
			isUsed:false,
			_restaurant:_restaurant,
			createDate:new Date()
		};
		if(remark){
			obj=_.merge(obj,{remark:remark});
		}else{
			obj=_.merge(obj,{remark:""});
		}
		Table.create(obj,function (err,table){
			if (err) { return handleError(res, err); }
			res.json(200,{table:table});
		});
	});
};


// 查询所有桌
exports.index = function (req, res){
	var language=req.headers.language,
		role = req.user.role,
		showService = req.query.showService,//默认是true
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	retrieval = req.query.retrieval;
    var state = req.query.state;//true,false,all,默认为all
    var _restaurant=req.query._restaurant;
    if(role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}

	var count;
	var condition={
		_restaurant:_restaurant
	};
	if(retrieval){
		condition=_.merge(condition,{name:{'$regex' : '.*' + retrieval + '.*'}});
	}
	if(state=="true"){
		condition=_.merge(condition,{isUsed:true});
	}else if(state=="false"){
		condition=_.merge(condition,{isUsed:false});
	}
	var doQuery=function(){
		Table.find(condition).count(function (err, c){
			if (err) {return handleError(res, err);}
			count = c;
		});
		Table.find(condition,{},{
			skip: (page - 1) * itemsPerPage,
			limit: itemsPerPage
		}).exec(function (err,tables){
			if (err) {return handleError(res, err);}
			return res.json(200, {
		        tables: tables,
		        count: count,
		        page:page,
		        itemsPerPage:itemsPerPage
		      });
		});
	};
	if(role=="restaurant"){
		doQuery();
	}else{
		if(showService=="false"){
			doQuery();
		}else{
			Waiter.findById(req.user._waiterProflie,function (err,waiter){
				if (err) {return handleError(res, err);}
				if (!waiter){return res.json(200,util.code404(language,'waiter'));}
				if(!waiter.serviceTables){
					waiter.serviceTables=[];
				}
				condition=_.merge(condition,{_id:{$in:waiter.serviceTables}});
				doQuery();
			});
		}
	}
}


//查询某一桌
exports.show = function (req, res) {
	var language=req.headers.language,
    	_table = req.params.id;
	Table.findById(_table,function (err, table){
		if (err) {return handleError(res, err);}
		if (!table){return res.json(200,util.code404(language,'table'));}
		return res.json(200, {table: table});
	});  
};

//更新桌子信息，通过id
exports.update = function(req,res){
	var language=req.headers.language,
		id=req.params.id;
	Table.findById(id,function (err,table){
		if (err) {return handleError(res, err);}
		if (!table){return res.json(200,util.code404(language,'table'));}
		var body=_.pick(req.body,"name","isUsed","remark");
		table=_.assign(table,body);
		table.save(function (err,table){
			if (err) {return handleError(res, err);}
			res.json(200,{table:table});
		});
	});
};

//通过id解锁单个桌子
exports.unlockTable=function (req,res){
	var language=req.headers.language,
		tableId=req.params.id;
	Table.findById(tableId,function (err,table){
		if (err) {return handleError(res, err);}
		if (!table){return res.json(200,util.code404(language,'table'));}
		table.isUsed=false;
		table.save(function (err,table){
			if (err) {return handleError(res, err);}
			res.json(200,{table:table});
		});
	});
};

//通过id删除
exports.destroy=function (req,res){
	var language=req.headers.language,
		id=req.params.id;
	Table.findById(id,function (err,table){
		if (err) { return handleError(res, err); }
		if (!table) {return res.json(200,util.code404(language,"table"));}
		if(table.isUsed){
			return res.json(200,util.code114(language,table.name));
		}
		table.remove(function (err){
			if (err) { return handleError(res, err); }
			res.json(200,util.code800(language));
		});
		
	});
};