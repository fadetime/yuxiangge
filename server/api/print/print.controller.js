'use strict';

var _ = require('lodash');
var Print = require('./print.model');
var Restaurant = require('../restaurant/restaurant.model');
var Category = require('../category/category.model');
var util = require('../../tool/util');
var language;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};

var getCategoryIds = function (cb){
	var categoryIds = [];
	Category.find({},function (err, categories){
		if (err) { return handleError(res, err); }
		_.each(categories,function (category){
			categoryIds.push(category._id.toString());
		});
		cb(categoryIds);
	});
};

exports.create = function (req, res){
	var name = req.body.name,
		productCategory = req.body.productCategory,
		_restaurant=req.body._restaurant;

	if(req.user.role == "restaurant"){
		_restaurant=req.user._restaurantProflie;
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	if(!name){
		return res.json(200,util.code301(language,"name"));
	}


	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		var obj={
			isPrintOrder:false,
			isPrintPanAndSoup:false,
			isPrintProduct:false,
			isPrintReduce:false,
			_restaurant:_restaurant,
			productCategory:[],
			isActive:false,
			createDate:new Date()
		};
		obj=_.assign(obj,_.pick(req.body,"name","isPrintOrder","isPrintPanAndSoup","isPrintProduct","productCategory"));
		obj.productCategory = util.getNoRepeatArr(obj.productCategory);

		if(obj.productCategory.length>0){
			Category.find({_id:{$in:productCategory}},function (err, category){
				if (err) { return handleError(res, err); }
				if(obj.productCategory.length != category.length){
					return res.json(200,util.code302(language,"productCategory"));
				}
				Print.create(obj,function (err, print){
					if (err) { return handleError(res, err); }
					res.json(200,{
						print:print
					});
				});
			});
		}else{
			Print.create(obj,function (err, print){
				if (err) { return handleError(res, err); }
				res.json(200,{
					print:print
				});
			});
		}
	});
};


exports.index = function (req, res){
	var _restaurant=req.query._restaurant,
		isDetail = req.query.isDetail;

	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	var condition={
		_restaurant:_restaurant
	};
	if(isDetail == "true"){
		Print.find(condition)
		.sort({createDate:-1})
		.populate('productCategory')
		.exec(function (err, prints){
			if (err) { return handleError(res, err); }
			getCategoryIds (function (categoryIds){
				_.each(prints,function (print){
					for(var i=0;i<print.productCategory.length;i++){
						var c = categoryIds.indexOf(print.productCategory[i]._id.toString());
						if(c<0){
							print.productCategory.splice(i,1);
						}
					}
				});
				res.json(200,{
					prints:prints
				});
			});
		});
	}else{
		condition = _.merge(condition,{isActive:true});
		Print.find(condition)
		.sort({createDate:-1})
		.exec(function (err, prints){
			if (err) { return handleError(res, err); }
			getCategoryIds (function (categoryIds){

				_.each(prints,function (print){
					for(var i=0;i<print.productCategory.length;i++){
						var c = categoryIds.indexOf(print.productCategory[i].toString());
						if(c<0){
							print.productCategory.splice(i,1);
						}
					}
				});
				res.json(200,{
					prints:prints
				});
			});
		});
	}
	
};


exports.show = function (req, res){
	var id = req.params.id;
	Print.findById(id,function (err, print){
		if (err) { return handleError(res, err); }
		if (!print) {return res.json(200,util.code404(language,"print"));}
		getCategoryIds (function (categoryIds){

			for(var i=0;i<print.productCategory.length;i++){
				var c = categoryIds.indexOf(print.productCategory[i].toString());
				if(c<0){
					print.productCategory.splice(i,1);
				}
			}
			res.json(200,{
				print:print
			});
		});
	});
};


exports.update = function (req, res){
	var id = req.params.id,
		productCategory = req.body.productCategory;

	getCategoryIds (function (categoryIds){
		if(productCategory){
			var open;
			for(var i=0;i<productCategory.length;i++){
				var c = categoryIds.indexOf(productCategory[i].toString());
				if(c<0){
					res.json(200,util.code404(language,"category"));
					open = true;
					break;
				}
			}
			if(open){return;}
		}
		var body=_.pick(req.body,"name","isPrintOrder","isPrintPanAndSoup","isPrintProduct","isPrintReduce","isActive","productCategory");
		if(body.name == ''){
			delete body.name;
		}
		Print.findById(id,function (err, print){
			if (err) { return handleError(res, err); }
			if (!print) {return res.json(200,util.code404(language,"print"));}
			print=_.assign(print,body);
			print.save(body,function (err, print){
				if (err) { return handleError(res, err); }
				res.json(200,{
					print:print
				});
			});
		});
	});
};

// exports.changeState = function (req, res){
// 	var id = req.params.id;

// 	Print.findById(id,function (err, print){
// 		if (err) { return handleError(res, err); }
// 		if (!print) {return res.json(200,util.code404(language,"print"));}
// 		print.isActive=!print.isActive;
// 		print.save(function (err, print){
// 			if (err) { return handleError(res, err); }
// 			res.json(200,{
// 				print:print
// 			});
// 		});
// 	});
// };


exports.destroy = function (req, res){
	var id = req.params.id;
	Print.findByIdAndRemove(id,function (err,print){
		if (err) { return handleError(res, err); }
		if (!print) {return res.json(200,util.code404(language,"print"));}
		res.json(200,util.code800(language));
	});
};