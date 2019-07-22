'use strict';

var _ = require('lodash');
var Order = require('./order.model');
var Order_change = require('./order_change.model');
var User = require('../user/user.model');
var Restaurant = require('../restaurant/restaurant.model');
var Customer = require('../customer/customer.model');
var Waiter = require('../waiter/waiter.model');
var Table = require('../table/table.model');
var ProductBasic = require('../product/productbasic.model');
var Product_info_chinese = require('../product/product_info_chinese.model');
var Product_info_english = require('../product/product_info_english.model');
var Pan_category = require('../pan_category/pan_category.model');
var Pan_soup = require('../pan_soup/pan_soup.model');
var Extra = require('../extra/extra.model');
var Member = require('../member/member.model');
var Integral = require('../integral/integral.model');
var Remind = require('../remind/remind');
var util = require('../../tool/util');
var config = require('../../tool/config');
var getResIdsArr = require('../restaurant/restaurant.controller').getResIdsArr;

var language;

var validationError = function(res, err) {
  return res.json(422, err);
};

var handleError = function (res, err) {
  return res.send(500, err);
};

//order数组
var arrGetShowName = function(arr){
	var orders=util.toObjectArr(arr);
	if(language=="english"){
		_.each(orders,function (order){
			if(order.pan_category){
				order.pan_category.showName=order.pan_category.name_english;
			}
			_.each(order.pan_soups,function (pan_soup){
				pan_soup.showName=pan_soup.name_english;
				pan_soup.describe_showname=pan_soup.describe_english;
				_.each(pan_soup.attribute,function (attr){
					attr.showName=attr.name_english;
					attr.value.showName=attr.value.name_english;
				});
			});
			_.each(order.products,function (product){
				product.showName=product.name_english;
			});
			_.each(order.extras,function (extra){
				extra.showName=extra.name_english;
			});
		});
	}else{
		_.each(orders,function (order){
			if(order.pan_category){
				order.pan_category.showName=order.pan_category.name;
			}
			_.each(order.pan_soups,function (pan_soup){
				pan_soup.showName=pan_soup.name;
				pan_soup.describe_showname=pan_soup.describe;
				_.each(pan_soup.attribute,function (attr){
					attr.showName=attr.name;
					attr.value.showName=attr.value.name;
				});
			});
			_.each(order.products,function (product){
				product.showName=product.name;
			});
			_.each(order.extras,function (extra){
				extra.showName=extra.name;
			});
		});
	}
	return orders;
};

//order sign
var signGetShowName = function(order){
	var order=order.toObject();
	if(language=="english"){
		
		if(order.pan_category){
			order.pan_category.showName=order.pan_category.name_english;
		}
		_.each(order.pan_soups,function (pan_soup){
			pan_soup.showName=pan_soup.name_english;
			pan_soup.describe_showname=pan_soup.describe_english;
			_.each(pan_soup.attribute,function (attr){
				attr.showName=attr.name_english;
				attr.value.showName=attr.value.name_english;
			});
		});
		_.each(order.products,function (product){
			product.showName=product.name_english;
		});
		_.each(order.extras,function (extra){
			extra.showName=extra.name_english;
		});
		
	}else{
		
			if(order.pan_category){
				order.pan_category.showName=order.pan_category.name;
			}
			_.each(order.pan_soups,function (pan_soup){
				pan_soup.showName=pan_soup.name;
				pan_soup.describe_showname=pan_soup.describe;
				_.each(pan_soup.attribute,function (attr){
					attr.showName=attr.name;
					attr.value.showName=attr.value.name;
				});
			});
			_.each(order.products,function (product){
				product.showName=product.name;
			});
			_.each(order.extras,function (extra){
				extra.showName=extra.name;
			});
		
	}
	return order;
};

//检查传入的产品结构是否符合规则
//return Boolean
var checkProductStructure = function (products){
	var result=true;
	_.each(products,function (product){
		if(!(product.orderQuantity>=0)){
			return result=false;
		}
		if(!product._product){
			return result=false;
		}
	});
	return result;
};

//检查传入的soup结构是否符合规则
//return Boolean
var checkSoupStructure = function (soups){
	var result=true;
	_.each(soups,function (soup){
		if(!soup._pan_soup){
			return result=false;
		}
		// if(!soup.attribute){
		// 	return result=false;
		// }
		if(soup.attribute&&soup.attribute!=''){
			_.each(soup.attribute,function (attr){
				var open=false;
				if(!attr._id){
					return result=false;
				}
				if(!attr.value){
					return result=false;
				}
				if(open){
					return;	
				}
			});
		}
	});
	return result;
};

//检查传入的extra结构是否符合规则
//return Boolean
var checkExtraStructure = function (extras){
	var result=true;
	_.each(extras,function (extra){
		if(!(extra.orderQuantity>=0)){
			return result=false;
		}
		if(!extra._extra){
			return result=false;
		}
	});
	return result;
};

//检查updateProducts结构是否符合规则
var checkUpdateProductsStructure = function(updateProducts){
	var result=true;
	_.each(updateProducts,function (updateProduct){
		if(!(updateProduct._id)){
			return result=false;
		}
		if(updateProduct.orderQuantity){
			if(isNaN(updateProduct.orderQuantity)){
				return result=false;
			}else{
				updateProduct.orderQuantity=util.dealNumber(parseFloat(updateProduct.orderQuantity));
			}
		}
		if(updateProduct.reduceQuantity){
			if(isNaN(updateProduct.reduceQuantity)){
				return result=false;
			}else{
				updateProduct.reduceQuantity=util.dealNumber(parseFloat(updateProduct.reduceQuantity));
			}
		}
		if(updateProduct.finalTotal){
			if(isNaN(updateProduct.finalTotal)){
				return result=false;
			}else{
				updateProduct.finalTotal=util.dealNumber(parseFloat(updateProduct.finalTotal));
			}
		}
	});
	return result;
};

//检查updateExtras结构是否符合规则
var checkUpdateExtrasStructure = function(updateExtras){
	var result=true;
	_.each(updateExtras,function (updateExtra){
		if(!(updateExtra._id)){
			return result=false;
		}
		if(updateExtra.orderQuantity){
			if(isNaN(updateExtra.orderQuantity)){
				return result=false;
			}else{
				updateExtra.orderQuantity=util.dealNumber(parseFloat(updateExtra.orderQuantity));
			}
		}
		if(updateExtra.finalTotal){
			if(isNaN(updateExtra.finalTotal)){
				return result=false;
			}else{
				updateExtra.finalTotal=util.dealNumber(parseFloat(updateExtra.finalTotal));
			}
		}
	});
	return result;
};

//检查updatePanCategory结构是否符合规则
var checkUpdatePanCategoryStructure = function(updatePanCategory){
	var result=true;
	if(updatePanCategory.finalTotal){
		if(isNaN(updatePanCategory.finalTotal)){
			return result=false;
		}else{
			updatePanCategory.finalTotal=util.dealNumber(parseFloat(updatePanCategory.finalTotal));
		}
	}
	return result;
};

//检查updatePanSoup结构是否符合规则
var checkUpdatePanSoupStructure = function(updatePanSoup){
	var result=true;
	if(!updatePanSoup._id){
		return result=false;
	}
	if(updatePanSoup.finalTotal){
		if(isNaN(updatePanSoup.finalTotal)){
			return result=false;
		}else{
			updatePanSoup.finalTotal=util.dealNumber(parseFloat(updatePanSoup.finalTotal));
		}
	}
	return result;
};

//Calculate order ,为了最后小数准确计算过程中先*100，最后再除以100，纯粹的加法
//计算内容为不含单个产品相关价格的其它所有价格
//return order
var orderCalculate = function(order){
	var pan_category=order.pan_category,
		pan_soups=order.pan_soups,
		products=order.products,
		extras=order.extras,
		status=order.status;
	// var preSum=0;//原价合计
	var sum=0;//最终合计,其它收费与锅final
	var productTotal=0;
	var ableDiscountTotal=0;
	var unAbleDiscountTotal=0;
	if(pan_category && !isNaN(pan_category.finalTotal)){
		sum+=pan_category.finalTotal*100;
	}
	if(pan_soups){
		var highPrice=0;
		_.each(pan_soups,function (pan_soup){
			// if(!isNaN(pan_soup.finalTotal)&&pan_soup.finalTotal>highPrice){//原有 取鍋底最高價
			// 	highPrice=pan_soup.finalTotal;
			// }
			if(!isNaN(pan_soup.finalTotal)){
				highPrice += pan_soup.finalTotal;
			}
		});
		sum+=highPrice*100;
	}
	if(products){
		_.each(products,function (product){
			productTotal+=product.finalTotal*100;
			if(product.ableDiscount){
				ableDiscountTotal+=product.finalTotal*100;
			}else{
				unAbleDiscountTotal+=product.finalTotal*100;
			}
		});
	}
	if(extras){
		_.each(extras,function (extra){
			sum+=extra.finalTotal*100;
		});
	}
	order.productTotal=util.dealNumber(productTotal/100);
	//计算折扣后的产品总价
	// order.finalProductTotal=util.dealNumber(order.productTotal*100*order.discount/100);
	console.log(ableDiscountTotal,unAbleDiscountTotal,order.discount);
	order.finalProductTotal=util.dealNumber((ableDiscountTotal*order.discount+unAbleDiscountTotal)/100);
	//折扣前订单总价
	order.total=(sum+order.productTotal*100)/100;
	//折扣后订单总价
	order.otherTotal=util.dealNumber(sum/100);

	sum=order.otherTotal*100+order.finalProductTotal*100;
	order.finalTotal=sum/100;
	
	var serviceCharge=0;//服务费
	var gst=0;//税
	if(status>="3"){
		serviceCharge=util.dealNumber(sum*order.servicePercent/100);
		gst=util.dealNumber((sum+serviceCharge*100)*order.gstPercent/100);
		// gst=util.dealNumber(sum*order.gstPercent/100);

	}
	order.serviceCharge=serviceCharge;
	order.gst=gst;
	order.subtotal=(sum+serviceCharge*100+gst*100)/100;
	return order;
};

//table state change
var tableStateChange = function(table,state){
	table.isUsed=state;
	table.save();
};

// if(err){
// 	if(err.code){
// 		return res.json(200,err);
// 	}else{
// 		return handleError(res, err);
// 	}
// }
// //验证soup有效性，并且将基础属性赋值
var findSoupInfo = function (soups,cb){
	var soupIds=[];

	_.each(soups,function (soup){
		soupIds.push(soup._pan_soup);
	});
	var error;
	var soupCondition={
		_id:{$in:soupIds}
	};
	Pan_soup.find(soupCondition,function (err,result_soups){
		if (err) { 
			error=err;
			return cb(error);
		}
		result_soups=util.toObjectArr(result_soups);
		// console.log(result_soups);
		_.each(soups,function (soup){
			var length=result_soups.length;
			var result;
			for(var i=0;i<length;i++){
				var highPrice=0;
				if(soup._pan_soup==result_soups[i]._id.toString()){
					soup=_.assign(soup,{
						name:result_soups[i].name,
						name_english:result_soups[i].name_english,
						image:result_soups[i].image,
						price:result_soups[i].price
					});
					if(result_soups[i].price>highPrice){
						highPrice=result_soups[i].price;
						soup.finalTotal=highPrice;
					}else{
						soup.finalTotal=0;
					}

					if(soup.attribute){
						_.each(soup.attribute,function (atr){
							var length=result_soups[i].attribute.length;
							var obj=result_soups[i];
							var result;
							for (var j = 0; j < length; j++) {
								if(atr._id==obj.attribute[j]._id.toString()){
									atr.name=obj.attribute[j].name;
									atr.name_english=obj.attribute[j].name_english;

									var findValue;
									_.each(obj.attribute[j].value,function (value){
										if(atr.value==value._id.toString()){
											atr.value=value;
											findValue=true;
											return false;
										}
									});
									if(!findValue){
										error=util.code404(language,"soup.attribute.value:"+atr.value);
										return false;
									}
									if(error){
										return false;;
									}

									result=true;
								}
							};

							if(!result){
								error=util.code404(language,"soup.attribute:"+atr._id);
								return false;
							}
							if(error){
								return false;
							}
						});
						// 补全剩余属性
						_.each(result_soups[i].attribute,function (attr){
							var pushAttr=_.pick(attr,"_id","name","name_english");
							var c=_.findWhere(soup.attribute,{_id:pushAttr._id.toString()});
							if(!c){
								var obj=_.findWhere(attr.value,{isDefault:true});
								pushAttr.value=obj;
								soup.attribute.push(pushAttr);
							}
						});
						result=true;
					}else{
						result=true;
					}
				}
				
			}
			if(!result){
				error=util.code404(language,"soup:"+soup._pan_soup);
				return false;
			}
			
			if(error){
				return false;
			}
		});

		cb(error,soups)

	});


};

// //验证product有效性，并且将基础属性赋值
var findProductInfo = function (products,cb){
	var productIds=[];

	_.each(products,function (product){
		productIds.push(product._product);
		ProductBasic.findByIdAndUpdate(product._product, { $inc: { quantity: product.orderQuantity * -1 }}).exec();
	});
	var error;
	var productCondition={
		// isActive:true,
		_id:{$in:productIds}
	};
	ProductBasic.find(productCondition,function (err,result_products){
		if (err) { 
			error=err;
			return cb(error);
		}
		result_products=util.toObjectArr(result_products);
		_.each(result_products,function (result_product){
			result_product.product_info_english=result_product.product_info;
		});
		ProductBasic.populate(result_products,{
			path:"product_info",
			model:"Product_info_chinese"
		},function (err,result_products){
			if (err) { 
				error=err;
				return cb(error);
			}

			ProductBasic.populate(result_products,{
				path:"product_info_english",
				model:"Product_info_english"
			},function (err,result_products){
				if (err) { 
					error=err;
					return cb(error);
				}
				_.each(products,function (product){
					var length=result_products.length;
					var result;
					for(var i=0;i<length;i++){
						if(product._product==result_products[i]._id.toString()){
							product=_.assign(product,{
								name:result_products[i].product_info.name,
								specificat:result_products[i].product_info.specificat,
								description:result_products[i].product_info.description,
								name_english:result_products[i].product_info_english.name,
								specificat_english:result_products[i].product_info_english.specificat,
								description_english:result_products[i].product_info_english.description,
								ableDiscount:result_products[i].ableDiscount,
								price:result_products[i].price,
								subtotal:util.dealNumber(result_products[i].price*product.orderQuantity),
								finalTotal:util.dealNumber(result_products[i].price*product.orderQuantity),
								_category:result_products[i].category,
								isDelivered:false
							});
							// console.log(product);
							result=result_products.splice(i,1);
							break;
						}
					}
					if(!result){
						error=util.code404(language,"product:"+product._product);
						return false;
					}
				});
				cb(error,products);
			});
		});
		

	});
};

//验证extra有效性，并且将基础属性赋值
var findExtraInfo = function (extras,cb){
	var extraIds=[];
	_.each(extras,function (extra){
		extraIds.push(extra._extra);
	});
	var extraCondition={
		isActive:true,
		_id:{$in:extraIds}
	};
	var error;
	Extra.find(extraCondition,function (err,result_extras){
		if (err) { 
			error=err;
			return cb(error);
		}
		result_extras=util.toObjectArr(result_extras);
		_.each(extras,function (extra){
			var length=result_extras.length;
			var result;
			for(var i=0;i<length;i++){
				if(extra._extra==result_extras[i]._id.toString()){
					extra=_.assign(extra,{
						name:result_extras[i].name,
						name_english:result_extras[i].name_english,
						specificat:result_extras[i].specificat,
						specificat_english:result_extras[i].specificat_english,
						price:result_extras[i].price,
						subtotal:util.dealNumber(result_extras[i].price*extra.orderQuantity),
						finalTotal:util.dealNumber(result_extras[i].price*extra.orderQuantity)
					});
					result=result_extras.splice(i,1);
					break;
				}
			}
			if(!result){
				error=util.code404(language,"extra:"+extra._extra);
				return false;
			}
		});

		cb(error,extras)

		
	});
};

//创建积分增加记录,更新用户积分
//积分相关操作
var dealIntegral = function(order){
	var _customer=order._customer;
	var _restaurant=order._restaurant;
	if(_customer){
		var condition={
			_customer:_customer
		};
		Restaurant.findById(_restaurant,function (err,restaurant){
			if(restaurant){
				getResIdsArr(restaurant,function (err,restaurantIds){
					if(!err){
						condition=_.merge(condition,{_restaurant:{$in:restaurantIds}});
						Member.findOne(condition,function (err,member){
							if(member){
								member.integral=util.dealNumber((member.integral*100+order.subtotal*restaurant.ratio*100)/100);
								var obj={
									_customer:_customer,
									integral:order.subtotal*restaurant.ratio,
									restaurant:{
										_restaurant:restaurant._id,
										name:restaurant.name
									},
									finalIntegral:member.integral,
									state:1,
									createDate:new Date()
								};
								member.save();
								Integral.create(obj);
							}else{
								var memberObj={
				               		_restaurant:order._restaurant,
				                	createDate:new Date(),
				               		integral:order.subtotal*restaurant.ratio,
				                	_customer:order._customer
				                };
				                var obj={
									_customer:_customer,
									integral:order.subtotal*restaurant.ratio,
									restaurant:{
										_restaurant:restaurant._id,
										name:restaurant.name
									},
									finalIntegral:memberObj.integral,
									state:1,
									createDate:new Date()
								};
								Member.create(memberObj);
								Integral.create(obj);
							}
						});
					}
				});
			}
		});
		
		
	}
	
	
};

//order点菜次数加1,赋值prodcut第几次点菜
var initOrderTimes = function(order,products){
	//点菜次数加加1
	if(!order.orderTimes){
		order.orderTimes=1;
	}else{
		order.orderTimes++;
	}
	_.each(products,function (pr){
		pr.orderTimes=order.orderTimes;
	});
};

//创建订单
exports.create=function (req,res){
	language=req.headers.language;
	var _waiter=req.user._waiterProflie,
		tableName=req.body.tableName,
		_customer=req.body._customer,//???
		number=req.body.number;
	var _restaurant="";
	if(!tableName){
		return res.json(200,util.code301(language,"tableName"));
	}
	if(!number){
		return res.json(200,util.code301(language,"number"));
	}
	if(isNaN(number)||number<0){
		return res.json(200,util.code302(language,"number"));
	}
	
	var dealDate=function (date){
		if(date<10){
			date='0'+date;
		}
		return date;
	};
	var dealIndex=function (date){
		if(date<10){
			date='000'+date;
		}else if(date<100){
			date='00'+date;
		}else if(date<1000){
			date='0'+date;
		}
		return date;
	};
	var now=new Date();
	var year=now.getFullYear().toString().substr(2,2),
		month=dealDate(now.getMonth()+1),
		day=dealDate(now.getDate()),
		hour=dealDate(now.getHours());
		// minute=now.getMinutes();
	
	var orderObj={
		createDate:new Date(),
		discount:1,
		status:1,
		orderTimes:0,
		customerCount:number,
		isPrint:true
	};
	Waiter.findById(_waiter)
	.populate("_restaurant")
	.exec(function (err,waiter){
		if (err) { return handleError(res, err); }
		if (!waiter) {return res.json(200,util.code404(language,"waiter"));}
		var updateRentaurant=function (){
			Restaurant.findById(waiter._restaurant,function (err, restaurant){
				if(err || !restaurant){return;}
				if(restaurant.doNumberIndex==9999){
					restaurant.doNumberIndex=0;
				}else{
					restaurant.doNumberIndex++;
				}
				restaurant.save();
			});
		};
		orderObj.waiter={
			_waiter:_waiter,
			name:waiter.name
		};
		orderObj._restaurant=waiter._restaurant._id;
		orderObj.servicePercent=waiter._restaurant.servicePercent;
		orderObj.gstPercent=waiter._restaurant.gstPercent;
		if(!waiter._restaurant.doNumberIndex&&0!=waiter._restaurant.doNumberIndex){
			waiter._restaurant.doNumberIndex=0;
		}else{
			waiter._restaurant.doNumberIndex++;
		}
		waiter._restaurant.save();
		orderObj.doNumber=year+month+day+hour+dealIndex(waiter._restaurant.doNumberIndex);
		var condition={
			name:tableName,
			_restaurant:orderObj._restaurant
		};
		// console.log(condition);
		Table.findOne(condition,function (err,table){
			if (err) { return handleError(res, err); }
			if (!table) {return res.json(200,util.code404(language,"table"));}
			if(table.isUsed){
				return res.json(200,util.code114(language,table.name));
			}
			orderObj.table={
				_table:table._id,
				name:table.name
			};
			var doCreate = function (){
				tableStateChange(table,true);
				var extraCondition={
					_restaurant:waiter._restaurant._id,
					isActive:true
				};
				Extra.find(extraCondition,function (err,extras){
					if (err) { 
						tableStateChange(table,false);
						return handleError(res, err); 
					}
					var extrasObj=[];
					_.each(extras,function (extra){
						var obj={
							_extra:extra._id,
							name:extra.name,
							name_english:extra.name_english,
							specificat:extra.specificat,
							specificat_english:extra.specificat_english,
							price:extra.price,
							orderQuantity:number,
							subtotal:util.dealNumber(extra.price*number),//预计收费
							finalTotal:util.dealNumber(extra.price*number)//最终收费
						};
						extrasObj.push(obj);
					});
					orderObj.extras=extrasObj;
					orderObj=orderCalculate(orderObj);
					Order.create(orderObj,function (err,order){
						if (err) { 
							tableStateChange(table,false);
							return handleError(res, err); 
						}
						order=signGetShowName(order);
						res.json(200,{order:order});
					});
				});
			};
			if(_customer){
				orderObj._customer=_customer;
				Customer.findById(_customer,function (err, customer){
					if (err) { return handleError(res, err); }
					if (!customer) {return res.json(200,util.code404(language,"customer"));}
					doCreate();
				});
			}else{
				doCreate();
			}
		});	
		waiter._restaurant.save();
	});
};

//customer start to order
exports.order = function (req,res){
	language=req.headers.language;
	var orderId=req.params.id,
		pan_category=req.body.pan_category,
		pan_soups=req.body.pan_soups,
		products=req.body.products,
		state=req.body.state;
	var order_change={};

	if(!state){
		return res.json(200,util.code301(language,"state"));
	}
	state=state.toString();
	switch(state){
		case "1":
			if(!pan_category){
				return res.json(200,util.code301(language,"pan_category"));
			}
			if(!pan_soups){
				return res.json(200,util.code301(language,"pan_soups"));
			}
			pan_soups=util.getNoRepeatArr(pan_soups);
			if(!checkSoupStructure(pan_soups)){
				return res.json(200,util.code302(language,"pan_soups"));
			}
			Order.findById(orderId,function (err,order){
				if (err) { return handleError(res, err); }
				if (!order) {return res.json(200,util.code404(language,"order"));}
				if(order.status>=3){
					return res.json(200,util.code405(language));
				}
				order_change=_.merge(order_change,{
					_order:orderId,
					doNumber:order.doNumber,
					table:order.table.toObject(),
					waiter:order.waiter.toObject(),
					_restaurant:order._restaurant,
					createDate:new Date(),
					state:state
				});
				Pan_category.findById(pan_category,function (err,pan_category){
					if (err) { return handleError(res, err); }
					if (!pan_category) {return res.json(200,util.code404(language,"pan_category"));}
					pan_category=pan_category.toObject();
					var pan_categoryObj={
						_pan_category:pan_category._id.toString(),
						name:pan_category.name,
						name_english:pan_category.name_english,
						image:pan_category.image,
						soupTotal:pan_category.soupTotal,
						subtotal:pan_category.subtotal,
						finalTotal:pan_category.subtotal,
						remark:""
					};
					order_change=_.merge(order_change,{
						pan_category:pan_categoryObj
					});

					findSoupInfo(pan_soups,function (err,pan_soups){
						if(err){
							if(err.code){
								return res.json(200,err);
							}else{
								return handleError(res, err);
							}
							
						}
						order_change=_.merge(order_change,{
							pan_soups:pan_soups
						});


						Order_change.create(order_change);
						// //更新订单信息
						order=_.assign(order,{
							pan_category:pan_categoryObj,
							pan_soups:pan_soups,
							status:2
						});

						order=orderCalculate(order);
						// res.json(200,{
						// 		order_change:order_change,
						// 		order:order
						// 	});
						order.save(function (err,order){
							if (err) { return handleError(res, err); }
							order=signGetShowName(order);
							res.json(200,{order:order});
						});
						
					});

				});
				
			});

			break;
		case "2":

		case "3":
			if(!products){
				return res.json(200,util.code301(language,"products"));
			}
			if(!checkProductStructure(products)){
				return res.json(200,util.code302(language,"products"));
			}
			Order.findById(orderId,function (err,order){
				if (err) { return handleError(res, err); }
				if (!order) {return res.json(200,util.code404(language,"order"));}
				if(order.status>=3){
					return res.json(200,util.code405(language));
				}
				order_change=_.merge(order_change,{
					_order:orderId,
					doNumber:order.doNumber,
					table:order.table.toObject(),
					waiter:order.waiter.toObject(),
					_restaurant:order._restaurant,
					createDate:new Date(),
					state:state
				});

				findProductInfo(products,function (err,products){
					if(err){
						if(err.code){
							return res.json(200,err);
						}else{
							return handleError(res, err);
						}
						
					}
					initOrderTimes(order,products);
					
					order_change=_.merge(order_change,{
						products:products
					});
					// 更新订单信息
					if(state==2){
						order=_.assign(order,{
							products:products,
							status:2
						});
					}else{
						order.products=products.concat(order.products);
					}
					order=orderCalculate(order);
					// res.json(200,{order:order});
					order.save(function (err,order){
						if (err) { return handleError(res, err); }
						Order_change.create(order_change);
						order=signGetShowName(order);
						res.json(200,{order:order});
					});

				});

				
			});
			break;
		default:
			return res.json(200,util.code302(language,"state"));
			break;
	}
};

//get order by id
exports.show = function (req,res){
	language=req.headers.language;
	var orderId=req.params.id;

	Order.findById(orderId)
	.populate("_customer _restaurant")
	.exec(function (err,order){
		if (err) { return handleError(res, err); }
		if (!order) {return res.json(200,util.code404(language,"order"));}
		order=signGetShowName(order);
		if(order._customer){
			User.findOne({_customerProflie:order._customer._id},function (err, user){
				if (err) { return handleError(res, err); }
				if (!user) {return res.json(200,util.code404(language,"user"));}
				order.account=user.account;
				res.json(200,{order:order});
			});
		}else{
			res.json(200,{order:order});
		}
	});
};

//update order
//waiter访问，只允许将status<3的订单 status=3
//restaurant,admin
//state=1.修改锅，2.修改折扣，3.结算，
//4订单完成，5订单取消,6.重新计算价格,7.减菜，8.减去额外收费项目
//9.修改个别菜品实收价格,数量(菜品更新操作),10.修改个别额外收费实收价格,数量(额外项目更新操作)，11.催菜，12.仅修改总费用
exports.update = function (req,res){
	language=req.headers.language;
	var orderId=req.params.id,
		updateProducts=req.body.updateProducts,
		reduceQuantity=req.body.reduceQuantity,
		updateExtras=req.body.updateExtras,
		updatePanCategory=req.body.updatePanCategory,
		updatePanSoup=req.body.updatePanSoup,
		discount=req.body.discount,
		isRebuildProductPrice=req.body.isRebuildProductPrice,
		payment=req.body.payment,
		changePayment=req.body.changePayment,
		state=req.body.state,
		subtotal=req.body.subtotal;
	var user=req.user,
		role=user.role;
	//extra 更新分支, state=delete,删除，state=update，更新
	var doUpdateExtra = function(order,updateExtras,state){
		if(!updateExtras){
			return res.json(200,util.code401(language,"updateExtras"));
		}
		if(!checkUpdateExtrasStructure(updateExtras)){
			return res.json(200,util.code402(language,"updateExtras"));
		}
		updateExtras=util.getNoRepeatArr(updateExtras);
		//遍历订单产品匹配并且更新
		var orderChangeExtras=[];
		_.each(updateExtras,function (extra){
			var length=order.extras.length;
			for(var i=0;i<length;i++){
				var ex=order.extras[i];
				if(extra._id==ex._id.toString()){
					if(state=="update"){
						ex=_.assign(ex,{
							orderQuantity:extra.orderQuantity,
							finalTotal:extra.finalTotal,
							remark:extra.remark
						});
					}
					//将ex加入数组
					orderChangeExtras.push(ex.toObject());
					if(state=="delete"){
						order.extras.splice(i,1);
					}
					return;
				}
			}
		});
		order=orderCalculate(order);
		var order_change={
			_order:orderId,
			doNumber:order.doNumber,
			table:order.table,
			waiter:order.waiter,
			_restaurant:order._restaurant,
			extras:orderChangeExtras,
			createDate:new Date(),
			state:state=="delete"?5:7
		};
		if(order_change.extras.length>0){
			Order_change.create(order_change);
		}
		
		order.save(function (err,order){
			if (err) { return handleError(res, err); }
			order=signGetShowName(order);
			res.json(200,{order:order});
		});
	};

	//product 更新分支, state=delete,删除，state=update，更新
	var doUpdateProduct = function(order,updateProducts,state){
		if(!updateProducts){
			return res.json(200,util.code401(language,"updateProducts"));
		}
		if(!checkUpdateProductsStructure(updateProducts)){
			return res.json(200,util.code402(language,"updateProducts"));
		}
		updateProducts=util.getNoRepeatArr(updateProducts);
		//遍历订单产品匹配并且更新
		var orderChangePrs=[];
		_.each(updateProducts,function (product){
			var length=order.products.length;
			for(var i=0;i<length;i++){
				var pr=order.products[i];
				if(product._id==pr._product.toString()){
					if(state=="update"){
						//请求中是否包含ableDiscount
						pr=_.assign(pr,{
							orderQuantity:product.orderQuantity,
							finalTotal:product.finalTotal,
							remark:product.remark,
							isDelivered:false,
							ableDiscount: product.ableDiscount
						});
					}
					if(state=="delete"){
						if((product.reduceQuantity || 0===product.reduceQuantity)&&(product.reduceQuantity<pr.orderQuantity)){
							pr.orderQuantity=pr.orderQuantity-product.reduceQuantity;
							var prClone=pr.toObject();
							prClone.orderQuantity=product.reduceQuantity;
							//将pr加入数组
							orderChangePrs.push(prClone);
							// console.log(prClone,pr);
						}else{
							//将退菜加入数组
							orderChangePrs.push(order.products[i]);
							// console.log(order.products[i]);
							order.products.splice(i,1);
							
							
						}
					}
					if(state=="urge"){
						orderChangePrs.push(order.products[i]);
					}
					return;
				}
			}
		});
		if(isRebuildProductPrice=="true"){
			_.each(order.products,function (product){
				product.subtotal=util.dealNumber(product.price*product.orderQuantity);
				product.finalTotal=util.dealNumber(product.price*product.orderQuantity)
			});
		}
		order=orderCalculate(order);
		var waiter={
			_waiter:order.waiter._waiter,
			name:order.waiter.name
		};
		var table={
			_table:order.table._table,
			name:order.table.name
		};
		// var order_change={
		// 	_order:orderId,
		// 	doNumber:order.doNumber,
		// 	table:order.table,
		// 	waiter:order.waiter,
		// 	_restaurant:order._restaurant,
		// 	products:orderChangePrs,
		// 	waiter:waiter,
		// 	table:table,
		// 	createDate:new Date(),
		// 	state:state=="delete"?4:(state=="urge"?11:6)
		// };
		var order_change={
			_order:orderId,
			doNumber:order.doNumber,
			_restaurant:order._restaurant,
			products:orderChangePrs,
			waiter:waiter,
			table:table,
			createDate:new Date(),
			state:state=="delete"?4:(state=="urge"?11:6)
		};
		// console.log(order_change);
		if(order_change.products.length>0){
			Order_change.create(order_change);
			// console.log(order_change);
		}
		order.save(function (err,order){
			if (err) { return handleError(res, err); }
			order=signGetShowName(order);
			res.json(200,{order:order});
		});
	};

	//pan_category 更新分支,state=update，更新
	var doUpdatePan = function(order){
		// if(!updatePanCategory){
		// 	return res.json(200,util.code401(language,"updatePanCategory"));
		// }
		if(updatePanCategory){
			if(!checkUpdatePanCategoryStructure(updatePanCategory)){
				return res.json(200,util.code402(language,"updatePanCategory"));
			}
			order.pan_category=_.assign(order.pan_category,{
				finalTotal:updatePanCategory.finalTotal,
				remark:updatePanCategory.remark
			});
		}
		if(updatePanSoup){
			if(!checkUpdatePanSoupStructure(updatePanSoup)){
				return res.json(200,util.code402(language,"updatePanSoup"));
			}
			_.each(order.pan_soups,function (pan_soup){
				if(pan_soup._id==updatePanSoup._id){
					pan_soup.finalTotal=updatePanSoup.finalTotal;
					pan_soup.remark=updatePanSoup.remark;
					return false;
				}
			});
		}
		
		order=orderCalculate(order);
		var order_change={
			_order:orderId,
			doNumber:order.doNumber,
			table:order.table,
			waiter:order.waiter,
			_restaurant:order._restaurant,
			pan_categroy:order.pan_category,
			createDate:new Date(),
			state:8
		};
		Order_change.create(order_change);
		order.save(function (err,order){
			if (err) { return handleError(res, err); }
			order=signGetShowName(order);
			res.json(200,{order:order});
		});
	};
	if(role=="waiter"){

		Order.findById(orderId,function (err,order){
			if (err) { return handleError(res, err); }
			if (!order) {return res.json(200,util.code404(language,"order"));}
			if(order.status>=3){
				return res.json(200,util.code405(language));
			}
			if(state=="7"){
				doUpdateProduct(order,updateProducts,"delete");
			}else if(state=="11"){
				doUpdateProduct(order,updateProducts,"urge");
			}else{
				
				order.status=3;
				order=orderCalculate(order);
				order.save(function (err,order){
					if (err) { return handleError(res, err); }
					order=signGetShowName(order);
					res.json(200,{order:order});
				});
			}
			
		});
		
	}else{
		// console.log('aaaa');
		if(!state){
			return res.json(200,util.code401(language,"state"));
		}
		
		Order.findById(orderId,function (err,order){
			if (err) { return handleError(res, err); }
			if (!order) {return res.json(200,util.code404(language,"order"));}

			
			state=state.toString();
			switch(state){
				case "1":
					doUpdatePan(order);
					break;
				case "2":
					if(!discount){
						return res.json(200,util.code401(language,"discount"));
					}
					if(discount>1||discount<0){
						return res.json(200,util.code402(language,"discount"));
					}
				
					order.discount=discount;
					// console.log(discount);
					order=orderCalculate(order);
					// res.json(200,{order:order});
					order.save(function (err,order){
						if (err) { return handleError(res, err); }
						order=signGetShowName(order);
						res.json(200,{order:order});
					});
					break;
				case "3":
					order.status=3;
					order=orderCalculate(order);
					order.save(function (err,order){
						if (err) { return handleError(res, err); }
						order=signGetShowName(order);
						res.json(200,{order:order});
					});
					
					break;
				case "4":
					// if(order.status!=3){
					// 	return res.json(200,util.code405(language));
					// }

					if(!payment){
						return res.json(200,util.code401(language,"payment"));
					}	
					if(payment!="cash"&&payment!="unionPay"&&payment!="credit"&&payment!="net"){
						return res.json(200,util.code402(language,"payment"));
					}
					order.payment=payment;
					order.isPrint=false;
					if(changePayment){	
						//只改变支付方式	
						order.save(200,function (err,order){
							if (err) { return handleError(res, err); }
							return res.json(200);
						});
					}else{
						order.status=4;
						if(order._customer){
							order.save(function (err,order){
								if (err) { return handleError(res, err); }	
								dealIntegral(order);
								order=signGetShowName(order);
								res.json(200,{order:order});
								Table.findById(order.table._table,function (err,table){
									if(table){
										tableStateChange(table,false);
									}
								});
							});
						}else{
							order.save(function (err,order){
								if (err) { return handleError(res, err); }
								order=signGetShowName(order);				
								res.json(200,{order:order});
								Table.findById(order.table._table,function (err,table){
									if(table){
										tableStateChange(table,false);
									}
								});
							});
						}
					}
					break;
				case "5":
					if(order.status>3){
						return res.json(200,util.code405(language));
					}
					order.status=5;
					order.save(function (err,order){
						if (err) { return handleError(res, err); }
						// dealIntegral(order);
						order=signGetShowName(order);
						res.json(200,{order:order});
						Table.findById(order.table._table,function (err,table){
							if(table){
								tableStateChange(table,false);
							}
						});
					});

					break;
				case "6":
					if(isRebuildProductPrice=="true"){
						_.each(order.products,function (product){
							product.subtotal=util.dealNumber(product.price*product.orderQuantity);
							product.finalTotal=util.dealNumber(product.price*product.orderQuantity)
						});
					}
					order=orderCalculate(order);
					order.save(function (err,order){
						if (err) { return handleError(res, err); }
						order=signGetShowName(order);
						res.json(200,{order:order});
					});
					break;
				case "7":
					if(order.status>=4){
						return res.json(200,util.code405(language));
					}
					doUpdateProduct(order,updateProducts,"delete");
					break;
				case "8":
					doUpdateExtra(order,updateExtras,"delete");
					break;
				case "9":
					doUpdateProduct(order,updateProducts,"update");
					break;
				case "10":
					doUpdateExtra(order,updateExtras,"update");
					break;
				case "11":
					if(order.status>=4){
						return res.json(200,util.code405(language));
					}
					doUpdateProduct(order,updateProducts,"urge");
					break;
				case "12":
					order.subtotal=subtotal;
					order.status=4;
					order.save(function (err,order){
						if (err) { return handleError(res, err); }	
						return res.json(200,{order:order});
					});	
					break;
				default:
					return res.json(200,util.code402(language,"state"));
					break;
			};
		});
	}
};

//bind-customer
exports.bindCustomer = function (req,res){
	language=req.headers.language;
	var orderId=req.params.id,
		_customer=req.body._customer;
	if(!_customer){
		return res.json(200,util.code401(language,"_customer"));
	}
	Order.findById(orderId)
	.populate("_customer")
	.exec(function (err,order){
		if (err) { return handleError(res, err); }
		if (!order) {return res.json(200,util.code404(language,"order"));}
		order._customer=_customer;
		order.save(function (err,order){
			if (err) { return handleError(res, err); }
			order=signGetShowName(order);
			Customer.populate(order,{
				path:"_customer",
				model:"Customer"
			},function (err,order){
				if (err) { return handleError(res, err); }
				res.json(200,{order:order});
			});
		});

	});

};

//服务员用换桌
exports.changeTable = function (req,res){
	language=req.headers.language;
	var _order=req.params.id,
		tableName=req.body.tableName,
		_restaurant=req.body._restaurant;
	var user=req.user;
	if(!tableName){
		return res.json(200,util.code401(language,"tableName"));
	}
	if(!_restaurant){
		return res.json(200,util.code401(language,"_restaurant"));
	}

	Order.findById(_order,function (err,order){
		if (err) { return handleError(res, err); }
		if (!order) {return res.json(200,util.code404(language,"order"));}
		if(order.status>3){
			return res.json(200,util.code405(language));
		}
		var condition={
			name:tableName,
			_restaurant:_restaurant
		};
		Table.findById(order.table._table,function (err,table){
			if (err) { return handleError(res, err); }
			if (!table) {return res.json(200,util.code404(language,"table"));}
			Table.findOne(condition,function (err,updateToTable){
				if (err) { return handleError(res, err); }
				if (!updateToTable) {return res.json(200,util.code404(language,"updateToTable"));}
				if(updateToTable.isUsed){
					return res.json(200,util.code114(language,updateToTable.name));
				}

				var updateParams={
					table:{
						_table:updateToTable._id,
						name:updateToTable.name
					}
				};
				tableStateChange(updateToTable,true);
				tableStateChange(table,false);

				order=_.assign(order,updateParams);
							
				order.save(function (err,order){
					if (err) {
						tableStateChange(table,true);
						tableStateChange(updateToTable,false);
						return handleError(res, err); 
					}
					order=signGetShowName(order);
					res.json(200,{order:order});
				});
			});
			
		});
		
	});
	
};

//用餐期间崩溃重新载入订单使用
exports.reload = function (req,res){
	language=req.headers.language;
	var tableName=req.query.tableName,
		_restaurant=req.query._restaurant;
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
	}
	if(!tableName){
		return res.json(200,util.code501(language,"tableName"));
	}
	if(!_restaurant){
		return res.json(200,util.code501(language,"_restaurant"));
	}
	Table.findOne({name:tableName,_restaurant:_restaurant},function (err,table){
		if (err) { return handleError(res, err); }
		if (!table) {return res.json(200,util.code404(language,"table"));}
		var condition={
			// table:{
			// 	_table:table._id.toString()
			// 	// name:tableName
			// 	// "_table": "57553eae874f0ba47676e913",
	  //  //          "name": "1号桌"
			// },
			_restaurant:_restaurant,
			status:{$lte:3}
		};
		// console.log(condition);
		Order.findOne(condition)
		.where("table._table")
		.equals(table._id.toString())
		.sort({"createDate": -1})
		.populate("_customer")
		.exec(function (err,order){
			if (err) { return handleError(res, err); }
			if (!order) {
				table.isUsed=false;
				table.save();
				return res.json(200,util.code404(language,"order"));
			}
			if(order._customer){
				User.findOne({_customerProflie:order._customer._id},function (err,user){
					if (err) { return handleError(res, err); }
					if (!user) {
						return res.json(200,util.code404(language,"user"));
					}
					order=signGetShowName(order);
					order._customer.account=user.account;
					order.account=user.account;
					res.json(200,{order:order});
				});
			}else{
				order=signGetShowName(order);
				res.json(200,{order:order});
			}
			
		});
	});
	
};

//将order与指定账号绑定
exports.bindAccount = function (req,res){
	language=req.headers.language;
	var value=req.params.id,
		account=req.body.account;
	if(!account){
		return res.json(200,util.code401(language,"account"));
	}
	var condition={
		account:account,
		role:"customer"
	};
	User.findOne(condition,function (err,user){
		if (err) { return handleError(res, err); }
		if (!user) {return res.json(200,util.code103(language));}
		if(value.length==24){
			condition={_id:value};
		}else{
			condition={doNumber:value};
		}
		Order.findOne(condition,function (err,order){
			if (err) { return handleError(res, err); }
			if (!order) {return res.json(200,util.code404(language,"order"));}
			if(order._customer) {
				return res.json(200,util.code407(language));
			}
			order._customer=user._customerProflie;
			order.save(function (err,order){
				if (err) { return handleError(res, err); }
				if (order.status=="4"){
					dealIntegral(order);
				}
				order=signGetShowName(order);
				Customer.populate(order,{
					path:"_customer",
					model:"Customer"
				},function (err,order){
					if (err) { return handleError(res, err); }
					res.json(200,{order:order});
				});
				
			});

		});
	});
	

};

//获取订单修改记录
exports.ongoingchange = function (req,res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 10,
    	isDeal = req.query.isDeal,
    	_restaurant = req.user._restaurantProflie;
    var count=0;
    var condition={
    	_restaurant:_restaurant
    	// state:{$lte:3}
    	// isDeal:{$ne:true}
    };
    switch(isDeal){
    	case "true":
    		condition=_.merge(condition,{isDeal:true});
    		break;
    	case "all":
    		break;
    	default:
    		condition=_.merge(condition,{isDeal:false});
    }
    Order_change.find(condition).count(function (err,c){
    	if (err) { return handleError(res, err); }
    	count=c;
    });
    Order_change.find(condition,{},{
    	skip:itemsPerPage*(page-1),
		limit:itemsPerPage
    })
    .sort({createDate:1})
    .exec(function (err,order_changes){
    	if (err) { return handleError(res, err); }
    	res.json(200,{
    		order_changes:order_changes,
    		page:page,
    		count:count
    	});
    });
};




//获取某个订单修改记录,默认获取全部记录
exports.oneorderchange = function (req, res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		orderId = req.params.id,
		state = req.query.state;
	var condition = {};
	var count=0;
	var getChanges = function (){
		Order_change.find(condition).count(function (err,c){
	    	if (err) { return handleError(res, err); }
	    	count=c;
	    });
		Order_change.find(condition,{},{
			skip:itemsPerPage*(page-1),
			limit:itemsPerPage
		}).exec(function (err, order_changes){
			if (err) { return handleError(res, err); }
			return res.json(200,{
	    		order_changes:order_changes,
	    		page:page,
	    		count:count
	    	});
		});
	};
	switch(state){
		case "1":
			condition = {_order:orderId, state:1};
			getChanges();
			break;
		case "2":
			condition = {_order:orderId, state:2};
			getChanges();
			break;
		case "3":
			condition = {_order:orderId, state:3};
			getChanges();
			break;
		case "4":
			condition = {_order:orderId, state:4};
			getChanges();
			break;
		case "5":
			condition = {_order:orderId, state:5};
			getChanges();
			break;
		case "6":
			condition = {_order:orderId, state:6};
			getChanges();
			break;
		case "7":
			condition = {_order:orderId, state:7};
			getChanges();
			break;
		case "8":
			condition = {_order:orderId, state:8};
			getChanges();
			break;
		case "9":
			condition = {_order:orderId, state:9};
			getChanges();
			break;
		case "10":
			condition = {_order:orderId, state:10};
			getChanges();
			break;
		default:
			condition = {_order:orderId};
			getChanges();
			break;
	};
};


//获取某天的所有订单信息或某个用户的订单
exports.index = function (req, res){
	language=req.headers.language;
	var page = req.query.page || 1,
    	itemsPerPage = req.query.itemsPerPage || 100,
		date = req.query.date,
		_customer = req.query._customer,
		_restaurant = req.query._restaurant,
		unPrinteOrders=req.query.unPrinteOrders,
		sortBy={createDate: -1};
	if(req.user.role=="restaurant"){
		_restaurant=req.user._restaurantProflie;
	}
	var condition = {};
	var count = 0;
	if(_restaurant){
		condition = _.merge(condition,{_restaurant:_restaurant});
	}
	if(unPrinteOrders){
		condition=_.merge(condition,{isPrint:false});
		itemsPerPage=5;
		sortBy={createDate:1};
	}
	console.log(new Date(parseInt(date)),date);
	if(date){
		if(isNaN(date)){
			return res.json(200,util.code502(language,"date"));
		}
		var getDate = new Date(parseInt(date));
		var getDate1 = new Date(parseInt(date));
		getDate.setHours(0);
		getDate.setMinutes(0);
		getDate.setSeconds(0);
		getDate.setMilliseconds(1);
		var startTime = getDate;
		getDate1.setHours(23);
		getDate1.setMinutes(59);
		getDate1.setSeconds(59);
		getDate1.setMilliseconds(999);
		var endTime = getDate1;
		condition = _.merge(condition,{createDate:{$gte:startTime,$lte:endTime}});
	}

	if(_customer){
		condition = _.merge(condition,{_customer:_customer});
	}
	Order.find(condition).count(function (err,c){
    	if (err) { return handleError(res, err); }
    	count=c;
    });
	Order.find(condition,{},{
		skip:itemsPerPage*(page-1),
		limit:itemsPerPage
	})
	.sort(sortBy)
	.populate('_customer')
	.populate('_restaurant')
	.exec(function (err, orders){
		if (err) { return handleError(res, err); }
		var customerId=[];
		_.each(orders,function(order){
			if(order._customer){
				customerId.push(order._customer._id);
			}
		});
		User.find({_customerProflie:{$in:customerId}},function (err, users){
			if (err) { return handleError(res, err); }
			orders=arrGetShowName(orders);
			if(users.length>0){
				_.each(users,function (user){
					_.each(orders,function (order){
						if(order._customer&&order._customer._id.toString()==user._customerProflie.toString()){
							order.account=user.account;
						}
					});
				});
			}
			return res.json(200,{
				orders:orders,
	    		page:page,
	    		count:count
			});
		});
	});
};

//修改某个orderchange的isDeal
exports.dealChange = function (req,res){
	language=req.headers.language;
	var order_changeId=req.params.id;
	Order_change.findByIdAndUpdate(order_changeId,{isDeal:true},function (err,order_change){
		if (err) { return handleError(res, err); }
		if (!order_change) {return res.json(200,util.code404(language,"order_change"));}
		res.json(200,{order_change:order_change});
	});
};	

//修改isDelivered
exports.changeDeliver = function (req,res){
	language=req.headers.language;
	var orderId=req.params.id,
		id=req.query.id;//数组中id，不是product._id
	if(!id){
		return res.json(200,util.code501(language,"id"));
	}
	Order.findById(orderId,function (err,order){
		if (err) { return handleError(res, err); }
		if (!order) {return res.json(200,util.code404(language,"order"));}
		var products=order.products;
		var length=products.length;
		for (var i=0;i<length;i++) {
			if(products[i]._id==id){
				products[i].isDelivered=!products[i].isDelivered;
				break;
			}
		}
		order.save(function (err){
			if (err) { return handleError(res, err); }
			res.json(200,{
				order:order
			});
		});
	});
};

var opt={};
var fileName;

exports.createTxt=function (orders,condition,cb){
	var _restaurant=condition._restaurant,
		startDate=condition.startDate,
		products=[],
		dataArr=[],
		subtotalBeforeDisc=0,
		subtotalAfterDisc=0,
		productTotals=0,
		finalProductTotals=0,
		gsts=0,
		serviceCharges=0,
		discs=0;
	_.each(orders,function (order){
		subtotalBeforeDisc+=order.total*100+order.gst*100;
		// productTotals+=order.productTotal;
		// finalProductTotals+=order.finalProductTotal;
		gsts+=order.gst*100;
		serviceCharges+=order.serviceCharge*100;
		subtotalAfterDisc+=order.finalTotal*100+order.gst*100;
	});
	subtotalBeforeDisc=util.dealNumber(subtotalBeforeDisc/100,'str');
	subtotalAfterDisc=util.dealNumber(subtotalAfterDisc/100,'str');
	gsts=util.dealNumber(gsts/100,'str');
	serviceCharges=util.dealNumber(serviceCharges/100,'str');
	discs=util.dealNumber((subtotalBeforeDisc*100-subtotalAfterDisc*100)/100,'str');

	var createOpt=function (index){
		var year=startDate.getFullYear().toString().substr(2, 2),
			month=startDate.getMonth()+1,
			day=startDate.getDate(),
			hour=startDate.getHours(),
			minute=startDate.getMinutes(),
			yymmdd=startDate.getFullYear().toString()+month.toString()+day.toString();
		var orderStartId;
		var orderEndId;
		if(orders.length>0){
			orderStartId=orders[0].doNumber;
			orderEndId=orders[orders.length-1].doNumber;
		}else{
			orderStartId='';
			orderEndId='';
		}
		var str='UPI001-2441'+'|'+'P01'+'|'+yymmdd+'|'+index+'|'+orderStartId+'|'+orderEndId+'|'+orders.length+'|'+subtotalBeforeDisc+'|'+gsts+'|'+'|'+serviceCharges+'|'+'|'+discs+'|'+'0.00'+'|'+subtotalAfterDisc;
		dataArr.push(str);
		opt={
			arr:dataArr,
			fileName:'dUPI001-2441'+'_'+'P01'+'_'+index+'_'+year+(month>10?month:('0'+month))+(day>10?day:('0'+day))+(hour>10?hour:('0'+hour))+(minute>10?minute:('0'+minute))
		};
		cb(null,opt);
	};
	Restaurant.findById(_restaurant,function (err, restaurant){
		if (err) { return cb(err); }
		if(!restaurant){return cb(util.code404(language,'restaurant'));}
		if(restaurant.nameIndex){
			createOpt(restaurant.nameIndex);
			if(parseInt(restaurant.nameIndex.toString())>9998){
				restaurant.nameIndex=1;
				restaurant.save();
			}else{
				restaurant.nameIndex++;
				restaurant.save();
			}
		}else{
			restaurant=_.assign(restaurant,{nameIndex:2});
			restaurant.save(function (err, restaurant){
				if (err) { return cb(err); }
				createOpt(1);
			});
		}
	});
};

//消费统计统计，没有时间段为当天时间
exports.statistic = function (req,res){
	language=req.headers.language;
	var _restaurant=req.user._restaurantProflie,
		startTime = req.query.startTime,
		endTime = req.query.endTime,//毫秒值
		state = req.query.state,//export,生成文件并且返回文件下载
		ftp = req.query.ftp;
	if(!startTime){
		return res.json(200,util.code501(language,"startTime"));
	}
	if(isNaN(startTime)){
		return res.json(200,util.code502(language,"startTime"));
	}
	if(endTime&&isNaN(endTime)){
		return res.json(200,util.code502(language,"endTime"));
	}
	var startDate = util.getTimePoint(new Date(parseInt(startTime)),"start");
	var endDate;
	if(endTime){
		endDate = util.getTimePoint(new Date(parseInt(endTime)),"end");
	}else{
		endDate = util.getTimePoint(new Date(parseInt(startTime)),"end");
	}
	var condition={
		_restaurant:_restaurant,
		status:4,
		createDate:{$gte:startDate,$lte:endDate}
	};
	Order.find(condition,function (err,orders){
		if (err) { return handleError(res, err); }
		if(state == "export"){
			condition={
				_restaurant:_restaurant,
				startDate:startDate
			};
			exports.createTxt(orders,condition,function (err){
				if (err) { return handleError(res, err); }
				return res.json(200);
			});
		}else{
			var givePrs=[];
			var result={
				unionPayCost:0,
				creditCost:0,
				netCost:0,
				cashCost:0,
				discountCost:0,
				givePrs:"",
				orderCount:orders.length
			};
			_.each(orders,function (order){
				if(order.discount!=1){
					result.discountCost=result.discountCost+order.total*100-order.finalTotal*100;
				}
				if(order.payment=="unionPay"){
					result.unionPayCost=result.unionPayCost+order.subtotal*100;
				}else if(order.payment=="credit"){
					result.creditCost=result.creditCost+order.subtotal*100;
				}else if(order.payment=="net"){
					result.netCost=result.netCost+order.subtotal*100;
				}else{
					result.cashCost=result.cashCost+order.subtotal*100;
				}
				_.each(order.products,function (product){
					//送菜记录
					if(product.finalTotal==0){
						var c=_.findWhere(givePrs,{_product:product._product});
						if(c){
							c.orderQuantity+=(product.orderQuantity*100);
						}else{
							givePrs.push({
								_product:product._product,
								name:product.name,
								name_english:product.name_english,
								orderQuantity:product.orderQuantity*100
							});
						}
					}
				});
			});
			_.each(givePrs,function (pr){
				if(language=="english"){
					result.givePrs+=(pr.name+"("+util.dealNumber(pr.orderQuantity/100)+")");
				}else{
					result.givePrs+=(pr.name_english+"("+util.dealNumber(pr.orderQuantity/100)+")");
				}
			});
			result.unionPayCost=util.dealNumber(result.unionPayCost/100);
			result.creditCost=util.dealNumber(result.creditCost/100);
			result.netCost=util.dealNumber(result.netCost/100);
			result.cashCost=util.dealNumber(result.cashCost/100);
			result.discountCost=util.dealNumber(result.discountCost/100);
			res.json(200,{
				statistic:result
			});
		}
		
	});
  	
};


exports.getStatistic=function (req,res){
	util.writerTXT(opt,function(fileName){
		util.readFile(fileName,res);
		Remind.ftp(opt);
	});
};

exports.changePrintState=function (req,res){
	language=req.headers.language;
	var orderId=req.params.id;
	Order.findById(orderId,function (err, order){
		if (err) { return handleError(res, err); }
		if (!order) {return res.json(200,util.code404(language,"order"));}
		order.isPrint=!order.isPrint;
		order.save(function (err){
			if (err) { return handleError(res, err); }
			return res.json(200,order);
		});
	});
};


