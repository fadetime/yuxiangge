'use strict';

var _ = require('lodash');
var Category = require('./category.model');
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

//检查二级分类的结构
var checkSeparatCategoryStructure = function (separatCategory){
	var open=true;
	_.each(separatCategory,function (category){
		if(!category.name||!category.name_english){
			return open=false;
		}
	});
	return open;
};

var arrGetShowName=function(categories){
	categories=util.toObjectArr(categories);
	if(language=="english"){
		_.each(categories,function (category){
			category.showName=category.name_english;
			_.each(category.separatCategory,function (sepCategory){
				sepCategory.showName=sepCategory.name_english;
			});
		});
	}else{
		_.each(categories,function (category){
			category.showName=category.name;
			_.each(category.separatCategory,function (sepCategory){
				sepCategory.showName=sepCategory.name;
			});
		});
	}
	return categories;
};

var signGetShowName=function(category){
	category=category.toObject();
	if(language=="english"){
		category.showName=category.name_english;
		_.each(category.separatCategory,function (sepCategory){
			sepCategory.showName=sepCategory.name_english;
		});
	}else{
		category.showName=category.name;
		_.each(category.separatCategory,function (sepCategory){
			sepCategory.showName=sepCategory.name;
		});
	}
	return category;
};


//create a category
exports.create=function(req,res){
	language=req.headers.language;
	var name=req.body.name,
		name_english=req.body.name_english,
		separatCategory=req.body.separatCategory;
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
	if(!separatCategory){
		return res.json(200,util.code301(language,"separatCategory"));
	}
	if(!checkSeparatCategoryStructure(separatCategory)){
		return res.json(200,util.code302(language,"separatCategory"));
	}
	var obj=_.pick(req.body,"name","name_english","separatCategory","seq");
	obj.createDate=new Date();
	obj._restaurant=_restaurant;
	if(isNaN(obj.seq)){
		obj.seq=config.defalutSeq;
	}
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		Category.create(obj,function (err,category){
			if (err) { return handleError(res, err); }
			category=signGetShowName(category);
			res.json(200,{category:category});
		});
	});
	
};

//get category
exports.index = function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		_restaurant=req.query._restaurant,
		// sortBy=req.query.sortBy,
		isAll=req.query.isAll;
	var sort={seq:1};
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	// if(sortBy=="seq"){
	// 	sort={
	// 		seq:1
	// 	};
	// }
	var count=0;
	var condition={
		_restaurant:_restaurant
	};
	Category.find(condition)
	.count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
		if(isAll=="true"){
			itemsPerPage=c;
			page=1;
		}
		Category.find(condition,{},{
			skip:itemsPerPage*(page-1),
			limit:itemsPerPage
		})
		.sort(sort)
		.exec(function (err,categories){
			if (err) { return handleError(res, err); }
			categories=arrGetShowName(categories);
			
			res.json(200,{
				categories:categories,
				count:count,
				page:page
			});
		});
	});
	

};

//get one category
exports.show = function (req,res){
	language=req.headers.language;
	var categoryId = req.params.id,
		_restaurant=req.user._restaurantProflie;
	var condition = {
		_id:categoryId,
		_restaurant:_restaurant
	};
	Category.findOne(condition,function (err, category){
		if (err) { return handleError(res, err); }
		if (!category) {return res.json(200,util.code404(language,"category"))}
		category=signGetShowName(category);
		return res.json(200,{category:category});
	});
};

//update categories seq
exports.updateSeq = function (req,res){
	language=req.headers.language;
	var categories=req.body.categories,
		_restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!categories){
		return res.json(200,util.code401(language,"categories"));
	}
	if(!_restaurant){
		return res.json(200,util.code401(language,"_restaurant"));
	}
	var index=0;
	var resJson= function(){
		res.json(200,util.code400(language));
	};
	var sortCondition={
		_id:{$in:categories},
		_restaurant:_restaurant
	};
	var otherCondition={
		_id:{$nin:categories},
		_restaurant:_restaurant
	};
	Category.find(sortCondition,function (err,sortCategories){
		if (err) { return handleError(res, err); }
		Category.find(otherCondition,function (err,otherCategories){
			if (err) { return handleError(res, err); }
			var length=sortCategories.length;
			if(length==0){
				resJson();
			}else{
				var open=true;
				_.each(otherCategories,function (category){
					category.seq=config.defalutSeq;
					category.save();
				});
				_.each(categories,function (signId){
					_.each(sortCategories,function (category){
						if(signId == category._id){
							index++;
							category.seq=index;
							category.save(function (err){
								if (err) { 
									open=false;
									return handleError(res, err); 
								}
								if(index==length&&open){
									resJson();
								}
							});
							return false;
						}
					});
				});
				
			}
			
		});
	});
	
	
};

//update category by id
exports.update = function (req,res){
	language=req.headers.language;
	var name=req.body.name,
		name_english=req.body.name_english,
		seq=req.body.seq,
		separatCategory=req.body.separatCategory;
	var id=req.params.id;
	if(separatCategory&&!checkSeparatCategoryStructure(separatCategory)){
		return res.json(200,util.code402(language,"separatCategory"));
	}
	if(seq&&isNaN(seq)){
		return res.json(200,util.code402(language,"seq"));
	}
	Category.findById(id,function (err,category){
		if (err) { return handleError(res, err); }
		if (!category) {return res.json(200,util.code404(language,"category"));}
		var updateParams={};
		if(name){
			updateParams=_.merge(updateParams,{name:name});
		}
		if(seq){
			updateParams=_.merge(updateParams,{seq:seq});
		}
		if(name_english){
			updateParams=_.merge(updateParams,{name_english:name_english});
		}
		if(separatCategory){
			updateParams=_.merge(updateParams,{separatCategory:separatCategory});
		}
		category=_.assign(category,updateParams);
		category.save();
		category=signGetShowName(category);
		res.json(200,{category:category});
	});
};

//根据id删除
exports.destory=function (req,res){
	language=req.headers.language;
	var categoryId = req.params.id;
	Category.findByIdAndRemove(categoryId,function (err,category){
		if (err) { return handleError(res, err); }
		if (!category) {return res.json(200,util.code404(language,"category"));}
		res.json(200,util.code800(language));
	});
};