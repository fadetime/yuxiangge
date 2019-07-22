'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var GiftSchema = new Schema({
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	name:String,
	name_english:String,
	quantity:Number,
	integralPrice:Number,
	image:String,
	isActive:Boolean,//是否上架？
	createDate:Date
});

module.exports = mongoose.model('Gift', GiftSchema);