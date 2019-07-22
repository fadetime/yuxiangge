'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var AttributeSchema = new Schema({
	name:String,
	name_english:String,
	value:[{
		name:String,
		name_english:String
	}],
	createDate:Date
	
});

module.exports = mongoose.model('Attribute', AttributeSchema);