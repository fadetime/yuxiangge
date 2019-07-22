'use strict';

var _ = require('lodash');
var Pan_soup = require('./pan_soup.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var language;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};



var arrGetShowName=function(pan_soups){
	pan_soups=util.toObjectArr(pan_soups);
	if(language=="english"){
		_.each(pan_soups,function (pan_soup){
			pan_soup.showName=pan_soup.name_english;
			pan_soup.describe_showname=pan_soup.describe_english;
			_.each(pan_soup.attribute,function (attr){
				attr.showName=attr.name_english;
				_.each(attr.value,function (v){
					v.showName=v.name_english;
				});
			});
		});
	}else{
		_.each(pan_soups,function (pan_soup){
			pan_soup.showName=pan_soup.name;
			pan_soup.describe_showname=pan_soup.describe;
			_.each(pan_soup.attribute,function (attr){
				attr.showName=attr.name;
				_.each(attr.value,function (v){
					v.showName=v.name;
				});
			});
		});
	}
	return pan_soups;
};

var signGetShowName=function(pan_soup){
	pan_soup=pan_soup.toObject();
	if(language=="english"){
		pan_soup.showName=pan_soup.name_english;
		pan_soup.describe_showname=pan_soup.describe_english;
		_.each(pan_soup.attribute,function (attr){
			attr.showName=attr.name_english;
			_.each(attr.value,function (v){
				v.showName=v.name_english;
			});
		});
	}else{
		pan_soup.showName=pan_soup.name;
		pan_soup.describe_showname=pan_soup.describe;
		_.each(pan_soup.attribute,function (attr){
			attr.showName=attr.name;
			_.each(attr.value,function (v){
				v.showName=v.name;
			});
		});
	}
	return pan_soup;
};

//初始化锅底属性默认值
var initAttrbiute = function(attribute){
	_.each(attribute,function (attr){
		var open=true;//是否没设置默认
		_.each(attr.value,function (v){
			if(open){
				if(v.isDefault!=true){
					v.isDefault=false;
				}else{
					open=false;
				}
			}else{
				v.isDefault=false;
			}
		});
		if(open){
			attr.value[0].isDefault=true;
		}
	});
};

//检查汤底属性是否符合要求
var checkAttr=function(arr){
	var result=true;
	_.each(arr,function (obj){
		if(!obj.name){
			return result=false; 
		}
		if(!obj.name_english){
			return result=false; 
		}
		if(!obj.value){
			return result=false; 
		}else{
			if(obj.value.length==0){
				return result=false; 
			}
			_.each(obj.value,function (v){
				if(!v.name){
					return result=false; 
				}
				if(!v.name_english){
					return result=false; 
				}
				if(!result){
					return;
				}
			})
		}
		if(!result){
			return;
		}
	});

	return result;
};

//检查收费信息是否完整
var checkSoupComplete = function (soup){
	var open=true;
	if(!util.strIsValued(soup.name)){
		return open=false;
	}
	if(!util.strIsValued(soup.name_english)){
		return open=false;
	}
	if(!util.strIsValued(soup.describe)){
		return open=false;
	}
	if(!util.strIsValued(soup.describe_english)){
		return open=false;
	}
	if(util.isInvalidNum(soup.price)){
		return open=false; 
	}
	return open;
};

// //根据对应语言将参数赋值,arr为soup
// var getAttr=function(language,arr){
// 	if(language=="english"){
// 		_.each(arr,function (obj){
// 			obj.showName=obj.name_english;
// 			_.each(obj.attribute,function (attr){
// 				attr.showName=attr.name_english;
// 				_.each(attr.value,function (v){
// 					v.showName=v.name_english;
// 				});
// 			});
// 		});
// 	}else{
// 		_.each(arr,function (obj){
// 			obj.showName=obj.name;
// 			_.each(obj.attribute,function (attr){
// 				attr.showName=attr.name;
// 				_.each(attr.value,function (v){
// 					v.showName=v.name;
// 				});
// 			});
// 		});
// 	}
// 	// console.log(arr);
// 	return arr;
// };

//创建锅底的种类
exports.create=function (req,res){
	language=req.headers.language;
	var name=req.body.name,
		name_english=req.body.name_english,
		image=req.body.image,
		attribute=req.body.attribute;
	var _restaurant=req.body._restaurant;
	console.log(req.body);
	if(req.user.role == "restaurant"){
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
	// if(!attribute){
	// 	return res.json(200,util.code301(language,"attribute"));
	// }
	if(attribute&&!checkAttr(attribute)){
		return res.json(200,util.code302(language,"attribute"));
	}
	Restaurant.findById(_restaurant,function (err,restaurant){
		if (err) { return handleError(res, err); }
		if (!restaurant) {return res.json(200,util.code404(language,"restaurant"));}
		var obj=_.pick(req.body,"name","name_english","attribute","describe","describe_english","image","price");
		obj.createDate=new Date();
		obj._restaurant=_restaurant;
		obj.isActive=false;
		initAttrbiute(obj.attribute);
		Pan_soup.create(obj,function (err,pan_soup){
			if (err) { return handleError(res, err); }
			pan_soup=signGetShowName(pan_soup);
			res.json(200,{pan_soup:pan_soup});
		});
	});
};

//获取锅底
exports.index=function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		_restaurant=req.query._restaurant,
		isActive=req.query.isActive;//默认为true
	if(req.user.role=="restaurant"){
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
	Pan_soup.find(condition)
	.count(function (err,c){
		if (err) { return handleError(res, err); }
		count=c;
	});
	Pan_soup.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.sort({createDate:-1})
	.exec(function (err,pan_soups){
		if (err) { return handleError(res, err); }
		pan_soups=arrGetShowName(pan_soups);
		res.json(200,{
			pan_soups:pan_soups,
			count:count,
			page:page
		});
	});
};


//获取锅底的某个种类
exports.show = function (req,res){
	language=req.headers.language;
	var pan_soupId = req.params.id;
	Pan_soup.findById(pan_soupId,function (err, pan_soup){
		if (err) { return handleError(res, err); }
		if (!pan_soup) {return res.json(200,util.code404(language,"pan_soup"));}
		pan_soup=signGetShowName(pan_soup);
		return res.json(200,{pan_soup:pan_soup});
	});
};

//update by id 
exports.update = function (req,res){
	language=req.headers.language;
	var pan_soupId = req.params.id;
	var body=_.pick(req.body,"name","name_english","attribute","describe","describe_english","image","price");
	// if(!body.attribute){
	// 	return res.json(200,util.code401(language,"attribute"));
	// }
	if(body.attribute&&!checkAttr(body.attribute)){
		return res.json(200,util.code402(language,"attribute"));
	}
	if(body.price&&util.isInvalidNum(body.price)){
		return res.json(200,util.code402(language,"price")); 
	}

	Pan_soup.findById(pan_soupId,function (err,pan_soup){
		if (err) { return handleError(res, err); }
		if (!pan_soup) {return res.json(200,util.code404(language,"pan_soup"));}
		pan_soup=_.assign(pan_soup,body);
		initAttrbiute(pan_soup.attribute);
		pan_soup.save(function (err,pan_soup){
			if (err) { return handleError(res, err); }
			pan_soup=signGetShowName(pan_soup);
			res.json(200,{pan_soup:pan_soup});
		});
	});
};


//修改汤底状态
exports.changeState = function (req,res){
	language=req.headers.language;
	var pan_soupId = req.params.id;
	var isActive = req.body.isActive;
	if(!isActive&&isActive!=false){
		return res.json(200,util.code401(language,"isActive"));
	}
	var doUpdate=function(cb){
		Pan_soup.findById(pan_soupId,function (err,pan_soup){
			if (err) { return handleError(res, err); }
			if (!pan_soup) {return res.json(200,util.code404(language,"pan_soup"));}
			pan_soup.isActive=isActive;
			cb(pan_soup);
			
		});
	};
	if(isActive=="true"||isActive==true){
		doUpdate(function (pan_soup){
			if(checkSoupComplete(pan_soup)){
				pan_soup.save(function (err,pan_soup){
					if (err) { return handleError(res, err); }
					pan_soup=signGetShowName(pan_soup);
					res.json(200,{pan_soup:pan_soup});
				});
			}else{
				return res.json(200,util.code406(language));
			}
			
		});
		
	}else if(isActive=="false"||isActive==false){
		doUpdate(function (pan_soup){
			pan_soup.save(function (err,pan_soup){
				if (err) { return handleError(res, err); }
				pan_soup=signGetShowName(pan_soup);
				res.json(200,{pan_soup:pan_soup});
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
	Pan_soup.findByIdAndRemove(id,function (err,pan_soup){
		if (err) { return handleError(res, err); }
		if (!pan_soup) {return res.json(200,util.code404(language,"pan_soup"));}
		res.json(200,util.code800(language));
	});
};