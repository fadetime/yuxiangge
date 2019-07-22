'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var RestaurantSchema = new Schema({
	name:String,
	logo:String,
	address:String,
	tel:String,
	servicePercent:Number,//小费百分比,默认0
	gstPercent:Number,//税率百分比，默认0.07
	notice:String,//公告
	integralRule:String,//积分规则
	ratio:Number,//积分兑换比例 如果写2,消费100,积分200.小数取整,默认为1:1
	nameIndex:Number,//用于命名txt，值在1-9999之间
	doNumberIndex:Number,//用于单号的命名,值在0-99之间
	createDate:Date,
	superior:{
		type:String,
		ref:"Restaurant"
	}//餐厅上级，只允许一层关系，即拥有该字段的餐厅不能设置分店，创建该餐厅信息的账号（餐厅）
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);