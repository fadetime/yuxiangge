'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewCustomerCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Member', 
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Member) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 20;
    self.sortBy = $stateParams.sortBy;
    self.retrieval = $stateParams.retrieval;
    Auth.setCurrentUser(function (currentUser){
      self._restaurant=currentUser._restaurantProflie._id;
    });

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
        .search('itemsPerPage',self.pagination.itemsPerPage)
        .search('sortBy',self.sortBy)
        .search('retrieval',self.retrieval);
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
   		loadCustomers();
   	};

   	var loadCustomers = function (){
   		var condition = {
            itemsPerPage:self.pagination.itemsPerPage,
            page:self.pagination.page,
            sortBy:self.sortBy,
            retrieval:self.retrieval,
            random:new Date().getTime()
        };
       	Member.index(condition,{},function (data){
       		self.customers = data.customers;

	        var count = data.count;
	        self.pagination.totalItems = count;
	        self.pagination.numPages = count/self.pagination.itemsPerPage;
       	},function (){

       	});
   	};

    self.pageChanged = function (){
        doLocation();
        loadCustomers();
    };

    init();

    self.changeSort = function(){
      if(self.sortBy=="integral"){
        delete self.sortBy;
      }else{
        self.sortBy="integral";
      }
      self.pagination.page=1;
      doLocation();
    };

    self.pageChanged=function(){
        doLocation();
    };

    //根据z账号查询
    self.select=function(){
        self.pagination.page=1;
        doLocation();
    };
  }]);
