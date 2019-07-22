'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CategorySchema = new Schema({
	_restaurant:{
		type:String,
		ref:'Restaurant'
	},
	name:String,
	name_english:String,
	separatCategory:[{
		name:String,
		name_english:String,
	}],
	seq:Number,
	createDate:Date
});

module.exports = mongoose.model('Category', CategorySchema);