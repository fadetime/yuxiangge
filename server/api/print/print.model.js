'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PrintSchema = new Schema({
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	name:String,
	isPrintOrder:Boolean,
	isPrintPanAndSoup:Boolean,
	isPrintProduct:Boolean,
	isPrintReduce:Boolean,
	productCategory:[{
		type:String,
		ref:"Category"
	}],
	isActive:Boolean,
	createDate:Date
});

module.exports = mongoose.model('Print', PrintSchema);