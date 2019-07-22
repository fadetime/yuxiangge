'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Pan_categorySchema = new Schema({
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	name:String,
	name_english:String,
	image:String,
	soupTotal:Number,//锅底总数
	subtotal:Number,//锅价
	createDate:Date,
	isActive:Boolean//是否上架,默认为不上架
});

module.exports = mongoose.model('Pan_category', Pan_categorySchema);