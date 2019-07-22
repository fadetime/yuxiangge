'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Pan_soupSchema = new Schema({
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	name:String,
	name_english:String,
	attribute:[{
		name:String,
		name_english:String,
		value:[{
			name:String,
			name_english:String,
			isDefault:Boolean//是否为默认口味，若全部选项没有，默认为第一个，有多个则第一个true有效
		}]
	}],
	describe:String,
	describe_english:String,
	image:String,
	createDate:Date,
	price:Number,
	isActive:Boolean,//是否上架,默认为不上架
});

module.exports = mongoose.model('Pan_soup', Pan_soupSchema);