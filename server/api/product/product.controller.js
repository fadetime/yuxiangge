'use strict';

var _ = require('lodash');
var ProductBasic = require('./productbasic.model');
var Product_info_chinese = require('./product_info_chinese.model');
var Product_info_english = require('./product_info_english.model');
var User = require('../user/user.model');
var Category = require('../category/category.model');
var Waiter = require('../waiter/waiter.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}

//检查产品语言信息结构是否正确
var checkLanguageStructure=function(info){
	var open=true;
	delete info._id;
	if(!util.strIsValued(info.name)){
		return open=false;
	}
	// if(!util.strIsValued(info.specificat)){
	// 	return open=false;
	// }
	// if(!info.description){
	// 	return open=false;
	// }
	return open;
};

//检查产品信息是否完整
var checkProductComplete = function (product,cb){
	if(!product.price&&product.price!=0){
		return cb(false);
	}
	if(isNaN(product.price)||product.price<0){
		return cb(false);
	}
	if(!product.quantity&&product.quantity!=0){
		return cb(false);
	}
	if(isNaN(product.quantity)||product.quantity<0){
		return cb(false);
	}
	Product_info_chinese.findById(product.product_info,function (err,info_chinese){
		if(err){
			return cb(false);
		}
		if(!checkLanguageStructure(info_chinese)){
			return cb(false);
		}
		Product_info_english.findById(product.product_info,function (err,info_english){
			if(err){
				return cb(false);
			}
			if(!checkLanguageStructure(info_english)){
				return cb(false);
			}
			return cb(true);
		});
	});
	
};

//对查询model,infoModel赋值
var getModel=function (model,language){
    model=Product_info_chinese;
    if(language=="english"){
    	model=Product_info_english;
    }
    return model;
};

var getInfoModel=function(infoModel,language){
	infoModel="Product_info_chinese";
	if(language=="english"){
    	infoModel="Product_info_english";
    }
    return infoModel;
};

//初始化分类信息，含showName,一二级增加other类
var initCategories=function(categories,language){
	
	var classifyObj={
		categories:categories,
		serchSeqArr:[]//匹配用二级分类数组
	};
	if(language=="english"){
		_.each(classifyObj.categories,function (category){
			var otherObj={
				name:'其它',
				name_english:'other'
			};
			category.showName=category.name_english;
			category.separatCategory.push(otherObj);
			var length=category.separatCategory.length;
			_.each(category.separatCategory,function (sepCategory){
				sepCategory.showName=sepCategory.name_english;
				sepCategory.products=[];
				sepCategory._category=category._id;
				if(category.separatCategory.indexOf(sepCategory)!=length-1){
					classifyObj.serchSeqArr.push(sepCategory);
				}
			});
		});
	}else{
		_.each(classifyObj.categories,function (category){
			var otherObj={
				name:'其它',
				name_english:'other'
			};
			category.showName=category.name;
			category.separatCategory.push(otherObj);
			var length=category.separatCategory.length;
			_.each(category.separatCategory,function (sepCategory){
				sepCategory.showName=sepCategory.name;
				sepCategory.products=[];
				sepCategory._category=category._id;
				if(category.separatCategory.indexOf(sepCategory)!=length-1){
					classifyObj.serchSeqArr.push(sepCategory);
				}
			});
		});
	}
	return classifyObj;
};

//对产品根据类别进行分类处理
var classifyProductByCategory=function (products,classifyObj){
	var classificationArr=classifyObj.categories,
		serchSeqArr=classifyObj.serchSeqArr;
	// console.log(serchSeqArr);
	_.each(products,function (product){
		// console.log(product);
		var notOtherOfCategory=[];
		//先遍历二级
		_.each(product.separatCategory,function (seqCategory){
			var length=serchSeqArr.length;
			for(var i=0;i<length;i++){
				if(serchSeqArr[i]._id==seqCategory){
					serchSeqArr[i].products.push(product);
					notOtherOfCategory.push(product._category);
					break;
				}
			}
			// var c=_.findWhere(serchSeqArr,{_id:seqCategory.toString()});
			// if(c){
			// 	console.log("xxxx");
			// 	c.products.push(product);
			// 	notOtherOfCategory.push(product._category);
			// }
		});
		//再遍历一级
		_.each(product.category,function (category){
			if(notOtherOfCategory.indexOf(category)==-1){
				var length=classificationArr.length;
				for(var i=0;i<length;i++){
					if(classificationArr[i]._id==category){
						classificationArr[i].separatCategory[classificationArr[i].separatCategory.length-1].products.push(product);
					}
				}
				// var c=_.findWhere(classificationArr,{_id:category});
				// if(c){
				// 	console.log("aaa");
				// 	c.separatCategory[c.separatCategory.length-1].products.push(product);
				// }
			}
		});
	});
	return classificationArr;
};

//create a product
exports.create=function(req,res){
	var language=req.headers.language,
		info_chinese=req.body.info_chinese,
		info_english=req.body.info_english;
	var _restaurant=req.body._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie
	}
	if(!_restaurant){
		return res.json(200,util.code301(language,"_restaurant"));
	}
	if(!info_chinese){
		return res.json(200,util.code301(language,"info_chinese"));
	}
	if(!info_english){
		return res.json(200,util.code301(language,"info_english"));
	}
	var obj=_.pick(req.body,"category","separatCategory","price","quantity","image","ableDiscount");
	if(util.isInvalidNum(obj.price)){
		return res.json(200,util.code302(language,"price"));
	}
	if(util.isInvalidNum(obj.quantity)){
		return res.json(200,util.code302(language,"quantity"));
	}
	obj.category=util.getNoRepeatArr(obj.category);
	obj.separatCategory=util.getNoRepeatArr(obj.separatCategory);
	obj.createDate=new Date();
	obj._restaurant=_restaurant;
	obj.isActive=false;
	info_chinese.createDate=new Date();
	info_english.createDate=new Date();
	
	if((typeof(obj.ableDiscount) == "boolean" && obj.ableDiscount==false)|| obj.ableDiscount=="false"){
		console.log(typeof(obj.ableDiscount));
		obj.ableDiscount=false;
	}else{
		obj.ableDiscount=true;
	}
	var doCreate=function(){
		//创建中文产品信息
		// res.json(200,obj);
		Product_info_chinese.create(info_chinese,function (err,pr_info_ch){
			if (err) { return handleError(res, err); }
			obj.product_info=pr_info_ch._id;
			info_english._id=pr_info_ch._id;
			Product_info_english.create(info_english,function (err){
				if (err) { return handleError(res, err); }
				ProductBasic.create(obj,function (err,pr){
					if (err) { return handleError(res, err); }
					res.json(200,{product:pr});
				});
			});
		});
	};

	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		var isCreate = true;
		var checkSeparatCategory = function(separatCategory,cb){
			if(separatCategory&&separatCategory.length>0){
				Category.find({})
				.where("separatCategory._id")
				.in(separatCategory)
				.exec(function (err,categories){
					_.each(obj.separatCategory,function (sign){
						var length=categories.length;
						var open=true;
						for(var i=0;i<length;i++){
							var sepCategoryArr=[];
							_.each(categories[i].separatCategory,function (sepCategory){
								sepCategoryArr.push(sepCategory._id.toString());
							});
							if(sepCategoryArr.indexOf(sign)>-1){
								return open=false;
							}
						}
						if(open){
							isCreate=false;
							return res.json(200,util.code404(language,"separatCategory:"+sign));
						}
					});
					if(isCreate){
						cb();
					}
				});
			}else{
				cb();
			}
		};
		if(obj.category&&obj.category.length>0){
			//查询这个餐厅是否存在这些类
			Category.find({_id:{$in:obj.category},_restaurant:_restaurant},function (err,categories){
				if (err) { return handleError(res, err); }
				_.each(obj.category,function (sign){
					var length=categories.length;
					var open=true;
					for(var i=0;i<length;i++){
						if(sign==categories[i]._id.toString()){
							categories.splice(i,1);
							return open=false;
						}
					}
					if(open){
						isCreate=false;
						return res.json(200,util.code404(language,"category:"+sign));
					}
				});
				if(isCreate){
					checkSeparatCategory(obj.separatCategory,doCreate);
				}
			});
		}else{
			checkSeparatCategory(obj.separatCategory,doCreate);
		}
	});
	
	
};


//show product
exports.index = function (req,res){
	var language=req.headers.language,
		user=req.user,
		role=user.role,
		_restaurant=req.query._restaurant,
		page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
    	retrieval = req.query.retrieval,
    	category=req.query.category,
    	separatCategory=req.query.separatCategory,
    	isActive=req.query.isActive,
    	isAll=req.query.isAll;
    var sortBy=req.query.sortBy;
    var sort={createDate:-1};
    if(sortBy=="price_down"){
    	sort={price:-1};
    }else if(sortBy=="price_up"){
    	sort={price:1};
    }
	if(role == 'restaurant'){
    	_restaurant = req.user._restaurantProflie;
    }
    if(!_restaurant){
    	return res.json(200,util.code501(language,'_restaurant'));
    }
    var condition={
    	_restaurant:_restaurant
    	// quantity:{$gte:1}
    };
    if(isActive){
    	condition=_.merge(condition,{isActive:isActive});
    }
    if(isAll=="true"){
    	delete condition.quantity;
    }
    var doRetrieval = function(){
    	var infoModel=getInfoModel(infoModel,language);
	    var Model=getModel(Model,language);
	    
	    var doQuery = function(){
	    	var count=0;
	    	ProductBasic.find(condition)
		    .count(function (err,c){
		    	if (err) { return handleError(res, err); }
		    	count=c;
		    });
		    ProductBasic.find(condition,{},{
				skip:itemsPerPage*(page-1),
				limit:itemsPerPage
			})
			.sort(sort)
			.exec(function (err,products){
				if (err) { return handleError(res, err); }
				ProductBasic.populate(products,{
					path:"product_info",
					model:infoModel
				},function (err,products){
					if (err) { return handleError(res, err); }
					res.json(200,{
						products:products,
						count:count,
						page:page
					});
				});
			});
	    };
	    if(retrieval){
			var selectName={name:{'$regex' : '.*' + retrieval + '.*',"$options":"$i"}};
			// console.log(selectName);
			Model.find(selectName,function (err,product_infos){
				if (err) { return handleError(res, err); }
				var infoArr=[];
				_.each(product_infos,function (info){
					infoArr.push(info._id);
				});
				condition=_.merge(condition,{product_info:{$in:infoArr}});
				doQuery();
			});
		}else{
			doQuery();
		}
    };

    if(separatCategory){
    	condition=_.merge(condition,{separatCategory:separatCategory});
    	// console.log(condition);
    	doRetrieval();
    }else{
    	if(category){
    		// console.log(category);
	    	Category.findById(category,function (err,category){
	    		if (err) { return handleError(res, err); }
				if (!category) {return res.json(200,util.code404(language,"category"));}
				category=category.toObject();
				// console.log(category);
				// var orArr=[{category:category._id.toString()}]
				// _.each(category.separatCategory,function (sepCategory){
				// 	orArr.push({separatCategory:sepCategory._id.toString()});
				// });

				// condition=_.merge(condition,{$or:orArr});
				var idArr=[]
				_.each(category.separatCategory,function (sepCategory){
					idArr.push(sepCategory._id.toString());
				});

				condition=_.merge(condition,{
					$or:[{category:category._id.toString()},{separatCategory:{$in:idArr}}]
				});
				// console.log(condition);
	    		doRetrieval();
	    	});
	    }else{
	    	// console.log(condition);
	    	doRetrieval();
	    }
    }
    
    
};

//分类返回
exports.classify = function (req,res){
	var language=req.headers.language,
		waiterId=req.user._waiterProflie;
	var sort={price:-1};
	Waiter.findById(waiterId,function (err,waiter){
		if (err) { return handleError(res, err); }
		if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
		var _restaurant=waiter._restaurant;
		var condition={
			_restaurant:_restaurant,
			isActive:true
		};
		var infoModel=getInfoModel(infoModel,language);
	    var Model=getModel(Model,language);
	    ProductBasic.find(condition)
		.sort(sort)
		.exec(function (err,products){
			if (err) { return handleError(res, err); }
			ProductBasic.populate(products,{
				path:"product_info",
				model:infoModel
			},function (err,products){
				if (err) { return handleError(res, err); }
				Category.find({_restaurant:_restaurant})
				.sort({seq:1})
				.exec(function (err,categories){
					if (err) { return handleError(res, err); }
					products=util.toObjectArr(products);
					categories=util.toObjectArr(categories);
					var classifyObj=initCategories(categories,language);
					var resultArr=classifyProductByCategory(products,classifyObj);
					res.json(200,{
						allProducts:products,
						classificationArr:resultArr//分类数组
						// length:products.length
					});
				});
				
			});
		});
	});
};

//
exports.showArr=function (req,res){
	var language=req.headers.language,
		productIds=req.body.productIds;
	if(!productIds){
		return res.json(200,util.code501(language,"productIds"));
	}
	console.log();
	var infoModel=getInfoModel(infoModel,language);
    ProductBasic.find({_id:{$in:productIds}},function (err,products){
    	if (err) { return handleError(res, err); }
    	ProductBasic.populate(products,{
			path:"product_info",
			model:infoModel
		},function (err,products){
			if (err) { return handleError(res, err); }
			res.json(200,{
				products:products
			});
		});
    })


};


//获取某个产品
exports.show = function (req,res){
	var language=req.headers.language,
		productId = req.params.id;
	ProductBasic.findById(productId)
	.populate("category")
	.exec(function (err,product){
		if (err) { return handleError(res, err); }
		if (!product) {return res.json(200,util.code404(language,"product"));}
		product=product.toObject();
		product.product_info_english=product.product_info;
		Category.find()
		.where("separatCategory._id")
		.in(product.separatCategory)
		.exec(function (err,categories){
			if (err) { return handleError(res, err); }
			var sepCategory=product.separatCategory;
			var length=sepCategory.length;
			categories=util.toObjectArr(categories);
			for(var i=0;i<length;i++){
				var open=true;
				_.each(categories,function (category){
					if(open){
						var queryCategory=category.separatCategory;
						var len=queryCategory.length;
						for(var j=0;j<len;j++){
							if(sepCategory[i]==queryCategory[j]._id){
								open=false;
								return sepCategory[i]=queryCategory[j];
							}
						}
					}else{
						return;
					}
				});
				if(open){
					sepCategory.splice(i,1);
					length=sepCategory.length;
					i--;
				}
			}
			ProductBasic.populate(product,{
				path:"product_info",
				model:"Product_info_chinese"
			},function (err, product){
				if (err) { return handleError(res, err); }
				ProductBasic.populate(product,{
					path:"product_info_english",
					model:"Product_info_english"
				},function (err, product){
					if (err) { return handleError(res, err); }
					for(var i=0;i<product.category.length;i++){
						var category=product.category[i];
						if(category){
							if(language=="english"){
								category.showName=category.name_english;
							}else{
								category.showName=category.name;
							}
						}else{
							var a=product.category.splice(i,1)
							i--;
						}
					}
					// _.each(product.category,function (category){
					// 	if(category){
					// 		if(language=="english"){
					// 			category.showName=category.name_english;
					// 		}else{
					// 			category.showName=category.name;
					// 		}
					// 	}
						
					// });
					_.each(product.separatCategory,function (category){
						if(language=="english"){
							category.showName=category.name_english;
						}else{
							category.showName=category.name;
						}
					});					
					return res.json(200,{product:product});
				});
			});
		});
		
	});
};

//update by id 
exports.update = function (req,res){
	var language=req.headers.language,
		productId = req.params.id;
	var body=_.pick(req.body,"category","separatCategory","price","quantity","image","ableDiscount","info_chinese","info_english");
	if(util.isInvalidNum(body.price)){
		return res.json(200,util.code402(language,"price"));
	}
	if(util.isInvalidNum(body.quantity)){
		return res.json(200,util.code402(language,"quantity"));
	}
	if(body.ableDiscount&&["true","false",true,false].indexOf(body.ableDiscount)<0){
		return res.json(200,util.code402(language,"ableDiscount"));
	}
	var updateLanguageInfo=function (model,id,info,cb){

		model.findById(id,function (err,pr_info){
			if (err) { return handleError(res, err); }
			if (!pr_info) {return res.json(200,util.code404(language,model+"_info"));}
			pr_info=_.assign(pr_info,info);
			pr_info.save();
			cb();
		});
	};

	ProductBasic.findById(productId,function (err,product){
		if (err) { return handleError(res, err); }
		if (!product) {return res.json(200,util.code404(language,"product"));}
		body.category=util.getNoRepeatArr(body.category);
		body.separatCategory=util.getNoRepeatArr(body.separatCategory);
		product=_.assign(product,body);
		product.save(function (err,product){
			if (err) { return handleError(res, err); }
			if(body.info_chinese){
				updateLanguageInfo(Product_info_chinese,product.product_info,body.info_chinese,function(){
					if(body.info_english){
						updateLanguageInfo(Product_info_english,product.product_info,body.info_english,function(){
							res.json(200,{product:product});
						});
					}
				});
			}else if(body.info_english){
				updateLanguageInfo(Product_info_english,product.product_info,body.info_english,function(){
					res.json(200,{product:product});
				});
			}else{
				res.json(200,{product:product});
			}
			
		});
	});
};

//change product isActive
exports.changeState = function (req,res){
	var language=req.headers.language,
		productId = req.params.id;
	var isActive = req.body.isActive;
	if(!isActive&&isActive!=false){
		return res.json(200,util.code401(language,"isActive"));
	}
	var doUpdate=function(cb){
		ProductBasic.findById(productId,function (err,product){
			if (err) { return handleError(res, err); }
			if (!product) {return res.json(200,util.code404(language,"product"));}
			product.isActive=isActive;
			cb(product);
			
		});
	};
	if(isActive=="true"||isActive==true){
		doUpdate(function (product){
			checkProductComplete(product,function (open){
				if(open){
					product.save(function (err,product){
						if (err) { return handleError(res, err); }
						res.json(200,{product:product});
					});
				}else{
					return res.json(200,util.code406(language));
				}
			});	
			
		});
		
	}else if(isActive=="false"||isActive==false){
		doUpdate(function (product){
			product.save(function (err,product){
				if (err) { return handleError(res, err); }
				res.json(200,{product:product});
			});
			
		});
	}else{
		return res.json(200,util.code402(language,"isActive"));
	}
}; 

//delete by id
exports.destroy = function (req,res){
	var language=req.headers.language,
		productId = req.params.id;
	ProductBasic.findById(productId,function (err,product){
		if (err) { return handleError(res, err); }
		if (!product) {return res.json(200,util.code404(language,"product"));}
		Product_info_english.findById(product.product_info,function (err,product_info_english){
			if (err) { return handleError(res, err); }
			if (!product_info_english) {return res.json(200,util.code404(language,"product_info_english"));}
			Product_info_chinese.findById(product.product_info,function (err,product_info_chinese){
				if (err) { return handleError(res, err); }
				if (!product_info_chinese) {return res.json(200,util.code404(language,"product_info_chinese"));}
				product.remove();
				product_info_chinese.remove();
				product_info_english.remove();
				res.json(200,util.code800(language));
			});
		});
	});	
};