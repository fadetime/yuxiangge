'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var IntegralSchema = new Schema({
	_customer:{
		type:String,
		ref:"Customer"
	},
	integral:Number,//增加或减少的积分
	restaurant:{
		_restaurant:String,
		name:String
	},
	gift:{
		_gift:String,
		name:String,
		name_english:String
	},
	finalIntegral:Number,//本次操作后的积分
	state:Number,//1.消费增加2.消费,3.res增加
	createDate:Date
});

module.exports = mongoose.model('Integral', IntegralSchema);

//保存之前先检查isDeal,state=2才设为false
IntegralSchema
  .pre('save', function(next) {
  	if (this.isNew){
  		if(this.state==2&&!this.isDeal){
	      this.isDeal=false;
	    }else{
	    	this.isDeal=true;
	    }
  	}
    
    next();
  });