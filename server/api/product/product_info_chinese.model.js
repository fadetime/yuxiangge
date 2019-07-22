'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Product_info_chineseSchema = new Schema({
	name:String,
	specificat:String
	// description:String
});

module.exports = mongoose.model('Product_info_chinese', Product_info_chineseSchema);