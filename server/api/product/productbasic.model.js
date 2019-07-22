'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ProductBasicSchema = new Schema({
	category:[{
		type:String,
		ref:"Category"
	}],
	separatCategory:[],
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	price:Number,
	quantity:Number,
	image:String,
	product_info:String,//联表产品信息
	isActive:Boolean,//是否上架,默认为不上架
	ableDiscount:Boolean,//是否能打折，默认为true
	createDate:Date
});

module.exports = mongoose.model('ProductBasic', ProductBasicSchema);