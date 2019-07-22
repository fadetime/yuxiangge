'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TableSchema = new Schema({
	_restaurant:{
		type:String,
		ref:'Restaurant'
	},
	name:String,
	isUsed:Boolean,
	remark:String,//备注，几人桌或者自己定义
	createDate:Date
});

module.exports = mongoose.model('Table', TableSchema);