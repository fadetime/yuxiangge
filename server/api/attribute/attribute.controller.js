'use strict';

var _ = require('lodash');
var Attribute = require('./attribute.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var config = require('../../tool/config');

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
}
var language;

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

var arrGetShowName=function(attributes){
	attributes=util.toObjectArr(attributes);
	if(language=="english"){
		_.each(attributes,function (attribute){
			attribute.showName=attribute.name_english;
			_.each(attribute.value,function (v){
				v.showName=v.name_english;
			});
		});
	}else{
		_.each(attributes,function (attribute){
			attribute.showName=attribute.name;
			_.each(attribute.value,function (v){
				v.showName=v.name;
			});
		});
	}
	return attributes;
};

var signGetShowName=function(attribute){
	attribute=attribute.toObject();
	if(language=="english"){
		attribute.showName=attribute.name_english;
		_.each(attribute.value,function (v){
			v.showName=v.name_english;
		});
	}else{
		attribute.showName=attribute.name;
		_.each(attribute.value,function (v){
			v.showName=v.name;
		});
	}
	return attribute;
};

//检查arttibute
var check=function(body){
	var open=true;
	var name=body.name,
		name_english=body.name_english,
		value=body.value;
	if(!name){
		return open=false;
	}
	if(!name_english){
		return open=false;
	}
	for(var i=0;i<value.length;i++){
		if(!value[i].name){
			open=false;
			break;
		}
		if(!value[i].name_english){
			open=false;
			break;
		}
	}
	return open;
};

//index
exports.index=function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100;
    var count=0;
    Attribute.find({}).count(function (err,c){
    	if (err) { return handleError(res, err); }
    	count=c;
    });
    Attribute.find({},{},{
    	skip:itemsPerPage*(page-1),
		limit:itemsPerPage
    })
    .sort({createDate:-1})
    .exec(function (err,attrs){
    	if (err) { return handleError(res, err); }
    	attrs=arrGetShowName(attrs);
    	res.json(200,{
    		attributes:attrs,
    		count:count,
    		page:page
    	});
    });


};

//create attribute
exports.create=function (req,res){
	language=req.headers.language;
	var body=req.body;
	if(check(body)){
		delete body._id;
		body.createDate=new Date();
		Attribute.create(body,function (err,attribute){
			if (err) { return handleError(res, err); }
			attribute=signGetShowName(attribute);
			res.json(200,{attribute:attribute});
		});
	}else{
		return res.json(200,util.code302(language,"body"));
	}
};

//delete all
exports.destroyAll=function (req,res){
	language=req.headers.language;
	Attribute.find({},function (err,attributes){
		if (err) { return handleError(res, err); }
		_.each(attributes,function (attribute){
			attribute.remove();
		});
		res.json(200,"try to delete");
	});
};

