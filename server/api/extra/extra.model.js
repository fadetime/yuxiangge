'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ExtraSchema = new Schema({
	_restaurant:{
		type:String,
		ref:'Restaurant'
	},
	name:String,
	name_english:String,
	specificat:String,
	specificat_english:String,
	price:Number,
	isActive:Boolean,
	createDate:Date
});

module.exports = mongoose.model('Extra', ExtraSchema);