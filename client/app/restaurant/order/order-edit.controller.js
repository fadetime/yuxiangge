'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('OrderEditlCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };

    var id=$stateParams.id;

    var loadOrder=function (){
      Order.show({id:id},{},function (data){
        self.order=data.order;
        self.showPayment=self.order.payment;
      },function (){

      });
    };

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

    var init=function (){
      if(!languagePack){
          return;
      }
      initIntervalIdsEmpty();
      self.languagePack=languagePack;
      loadOrder();
    };

    self.saveProduct=function (){
      console.log('aaaaa');
      var products=[];
      _.each(self.order.products,function (product){
        var obj={
          _id:product._product,
          orderQuantity:product.orderQuantity,
          finalTotal:product.finalTotal
        };
        products.push(obj);
      });
      var condition={
        updateProducts:products,
        state:9
      };
      Order.update({id:id},condition,function (data){
        if(data.code){
          return alert(data.msg);
        }
        alert('success');
      },function (){

      });
    };

    self.choosePayment=function (value){
      switch(value){
        case 'cash':
          self.showPayment='cash';
          break;
        case 'unionPay':
          self.showPayment='unionPay';
          break;
        case 'credit':
          self.showPayment='credit';
          break;
        case 'net':
          self.showPayment='net';
          break;
        case 'visa':
          self.showPayment='visa';
          break;
        case 'master':
          self.showPayment='master';
          break;
        case 'amexs':
          self.showPayment='amexs';
          break;
        case 'diners':
          self.showPayment='diners';
          break;
        case 'grabPay':
          self.showPayment='grabPay';
          break;
        case 'aliPay':
          self.showPayment='aliPay';
          break;
        case 'wechat':
          self.showPayment='wechat';
          break;
      };
      self.openChoose=false;
    };

    self.savePayment=function (){
      var condition={
        state:4,
        payment:self.showPayment,
        changePayment:'changePayment'
      };
      Order.update({id:id},condition,function (){
        alert('success');
      },function (){

      });
    };

    self.saveSubtotal=function (){
      var condition={
        state:12,
        subtotal:self.order.subtotal
      };
      Order.update({id:id},condition,function (){
        alert('success');
      },function (){

      });
    };
    
    
    init();
  }]);
