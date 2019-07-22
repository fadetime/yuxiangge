'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Order_changeSchema = new Schema({
	_order:{
		type:String,
		ref:'Order'
	},
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
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	pan_category:{
		_pan_categroy:{
			type:String,
			ref:'Pan_category'
		},
		name:String,
		name_english:String,
		soupTotal:Number,//锅底总数
		subtotal:Number,//锅价
		finalTotal:Number,
		remark:String
	},
	pan_soups:[{
		_pan_soup:{
			type:String,
			ref:'Pan_soup'
		},
		name:String,
		name_english:String,
		attribute:[{
			name:String,
			name_english:String,
			value:{
				name:String,
				name_english:String,
				isDefault:Boolean//是否为默认口味，若全部选项没有，默认为第一个，有多个则第一个true有效
			}
		}]
	}],
	products:[{   
		_product:String,
		_category:[String],
		name:String,
		name_english:String,
		specificat:String,
		specificat_english:String,
		description:String,
		description_english:String,
		orderQuantity:Number,
		price:Number,
		subtotal:Number,//预计收费
		finalTotal:Number,//最终收费
		remark:String//备注
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
	doNumber:Number,//订单号
	state:Number,//1.锅底，2.原单，3.加菜，4.admin,restaurant操作,减菜，products为本次操作结果，5.admin,restaurant操作，减去额外收费项目，extras为本次操作结果，
	// 6.admin,restaurant操作,更新菜品信息，products为本次操作结果，7.admin,restaurant操作，额外收费项目更新，extras为本次操作结果,8.额外修改锅的参数
	createDate:Date,
	isDeal:Boolean//是否已经打单

});

module.exports = mongoose.model('Order_change', Order_changeSchema);

//保存之前先检查isDeal,state=1,2,3才设为false
Order_changeSchema
  .pre('save', function(next) {
  	if (this.isNew){
  		if((this.state<=4 || this.state==6 || this.state==11)&&!this.isDeal){
	      this.isDeal=false;
	    }else{
	    	this.isDeal=true;
	    }
  	}
    
    next();
  });