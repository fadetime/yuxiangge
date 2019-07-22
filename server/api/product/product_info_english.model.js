'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Product_info_englishSchema = new Schema({
	name:String,
	specificat:String
	// description:String
});

module.exports = mongoose.model('Product_info_english', Product_info_englishSchema);