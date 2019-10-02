'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var OrderSchema = new Schema({
	table:{
		_table:{
			type:String,
			ref:'table'
		},
		name:String
	},
	waiter:{
		_waiter:{
			type:String,
			ref:'Waiter'
		},
		name:String
	},
	_customer:{
		type:String,
		ref:"Customer"
	},
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	pan_category:{
		_pan_category:{
			type:String,
			ref:'Pan_category'
		},
		name:String,
		name_english:String,
		image:String,
		soupTotal:Number,//锅底总数
		subtotal:Number,//锅价
		finalTotal:Number,//最后实收价格
		remark:String
	},
	pan_soups:[{
		_pan_soup:{
			type:String,
			ref:'Pan_soup'
		},
		name:String,
		name_english:String,
		image:String,
		price:Number,
		finalTotal:Number,//最终收费
		remark:String,//备注
		attribute:[{
			name:String,
			name_english:String,
			value:{
				name:String,
				name_english:String
			}
		}]
	}],
	products:[{    
		_product:{
			type:String,
			ref:'Product'
		},
		name:String,
		name_english:String,
		specificat:String,
		specificat_english:String,
		description:String,
		description_english:String,
		ableDiscount:Boolean,//是否能打折，默认为true
		orderQuantity:Number,
		price:Number,
		subtotal:Number,
		finalTotal:Number,//最终收费
		remark:String,//备注
		orderTimes:Number,//点菜次数，第几次点菜
		isDelivered:{
			type:Boolean,
			default:false
		}//是否已配送
	}],
	extras:[{
		_extra:{
			type:String,
			ref:'Extra'
		},
		name:String,
		name_english:String,
		specificat:String,
		specificat_english:String,
		price:Number,
		orderQuantity:Number,
		subtotal:Number,//预计收费
		finalTotal:Number,//最终收费
		remark:String//备注
	}],
	customerCount:Number,//客户人数
	isPrint:Boolean,//默认false
	doNumber:String,//订单号
	discount:Number,//折扣，默认为1
	productTotal:Number,//产品合计原价
	finalProductTotal:Number,//产品合计，折扣后的价格
	total:Number,//订单合计原价,不加服务费，税
	finalTotal:Number,//订单合计，折扣后的价格
	servicePercent:Number,//小费百分比,默认0
	serviceCharge:Number,
	gstPercent:Number,//税率百分比，默认0.07
	gst:Number,
	otherTotal:Number,//其它合计，锅底+额外收费记录
	subtotal:Number,//最终收费，总价
	createDate:Date,
	status:Number,//1.订桌,2.进行,3.结算,4.完成，5.取消
	payment:String,//支付方式，cash,unionPay,credit,net
	orderTimes:Number,//点菜次数
	//20191002 add coupon feature
	coupon_id:{ type: String, default: null},
	coupon_name:{ type: String, default: null},
	coupon_name_en:{ type: String, default: null},
	coupon_value:{ type: Number, default: 0},
	coupon_after:{ type: Number, default: 0}//subtotal - coupon_value
});

module.exports = mongoose.model('Order', OrderSchema);