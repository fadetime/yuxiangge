'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ConsumeDetailCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var orderId = $stateParams.id;

    var initIntervalIdsEmpty=function (){
      _.each(orderIntervalIds,function (id){
        clearInterval(id);
      });
      _.each(productIntervalIds,function (id){
        clearInterval(id);
      });
      orderIntervalIds=[];
      productIntervalIds=[];
    };

    var init = function (){
      if(!languagePack){
          return;
      }
      initIntervalIdsEmpty();
      self.languagePack=languagePack;
  		loadOrder();
  	};
    //保留两位小数
    var dealNumber=function(num){
      var num2=num.toFixed(3);
      return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+3));
    };

    var getLeftDivHeight = function (extras,pan_category){
      var index = 0;
      _.each(extras, function (extra){
        index++;
      });
      if(pan_category){
        self.extraHeight=36*(index+3);
      }else{
        self.extraHeight=36*(index+2);
      }
      
    };

    var getRightDivHeight = function (products){
      var index = 0;
      _.each(products, function (product){
        index++;
      });
      self.productHeight=36*(index+2);
    };

    var heightChange = function (){
      if(self.extraHeight<=self.productHeight){
        self.extraHeight = self.productHeight;
        self.extraHeight="height:" + self.extraHeight + "px;";
        // self.productHeight="height:" + self.productHeight + "px;";
      }
      self.productHeight="height:" + self.productHeight + "px;";
    };


    var loadOrder = function (){
       	Order.show({id:orderId,random:new Date().getTime()},{},function (data){
       		self.order = data.order;
          self.pan_category = data.order.pan_category;
          self.extras = data.order.extras;
          getLeftDivHeight(self.extras,self.pan_category);
          self.products = data.order.products;
          getRightDivHeight(self.products);
          self.discount = self.order.discount;
          self.servicePercent = dealNumber(self.order.servicePercent*100);
          self.gstPercent = dealNumber(self.order.gstPercent*100);
          heightChange();
       	},function (){

       	});
   	};
   
    init();
    
  }]);
