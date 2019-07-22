'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ConsumeRecordCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
	var customerId = $stateParams.id;
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 20;
   
    self.pagination = {
  		page: page,
  		itemsPerPage: itemsPerPage,
  		maxSize: 5,
  		numPages: null,
  		totalItems: null
  	};
  	var doLocation = function (){
      $location
        .search('page',self.pagination.page)
        .search('itemsPerPage',self.pagination.itemsPerPage);
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

    var init = function (){
      if(!languagePack){
          return;
      }
      initIntervalIdsEmpty();
      self.languagePack=languagePack;
  		loadOrders();
  	};

  	var loadOrders = function (){
   		var condition = {
            itemsPerPage:self.pagination.itemsPerPage,
            page:self.pagination.page,
            _customer:customerId,
            random:new Date().getTime()
        };
       	Order.index(condition,{},function (data){
       		self.orders = data.orders;
       		_.each(self.orders,function (order){
       			order.hour = new Date(order.createDate).getHours();
       			order.minute = new Date(order.createDate).getMinutes();
       		});

	        var count = data.count;
	        self.pagination.totalItems = count;
	        self.pagination.numPages = count/self.pagination.itemsPerPage;

       	},function (){

       	});
   	};

   	self.pageChanged = function (){
        doLocation();
        loadOrders();
    };

    init();
    
  }]);
