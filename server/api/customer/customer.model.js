'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CustomerSchema = new Schema({
	name:String,
	image:String,
	createDate:Date
});

module.exports = mongoose.model('Customer', CustomerSchema);