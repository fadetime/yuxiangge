'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('IntegralRecordCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Integral', 
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Integral) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var customerId = $stateParams.id;
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 20;
    var _restaurant = $stateParams._restaurant;

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

    var loadIntegrals = function (){
   		var condition = {
            itemsPerPage:self.pagination.itemsPerPage,
            page:self.pagination.page,
            _customer:customerId,
            _restaurant:_restaurant,
            random:new Date().getTime()
        };

       	Integral.index(condition,{},function (data){
       		self.integrals = data.integrals;

          _.each(self.integrals,function (integral){
            var state = integral.state;
            switch(state){
              case 1:
                integral.integral = '+'+integral.integral;
                integral.event = self.languagePack.restaurant.integral.getIntegral + ' '+ integral.integral;
                break;
              case 2:
                integral.integral = '-'+integral.integral;
                integral.event = self.languagePack.restaurant.integral.exchangeIntegral + ' '+ integral.gift.showName + ' '+ self.languagePack.restaurant.integral.consumptionIntegral + integral.integral;
                break;
              default:
                integral.integral = '+'+integral.integral;
                integral.event = self.languagePack.restaurant.integral.extraPoints + ' '+ integral.integral;
                break;
            };
          });

	        var count = data.count;
	        self.pagination.totalItems = count;
	        self.pagination.numPages = count/self.pagination.itemsPerPage;

       	},function (){

       	});
   	};

    self.pageChanged = function (){
        if(!languagePack){
            return;
        }
        doLocation();
        loadIntegrals();
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
    	loadIntegrals();
    };
   
    init();
  }]);
