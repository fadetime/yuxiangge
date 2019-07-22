'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MemberSchema = new Schema({
	_customer:{
		type:String,
		ref:"Customer"
	},
	integral:Number,
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},//customer注册餐厅
	createDate:Date

});

module.exports = mongoose.model('Member', MemberSchema);