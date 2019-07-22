'use strict';

angular.module('kuaishangcaiwebApp')
  .config(function ($stateProvider) {
    $stateProvider
    // 餐厅admin
	  .state('admin-restaurant-view', {
	    url: '/admin/restaurant-view?token&hasNav&retrieval&sortBy&page&itemsPerPage&search',
	    templateUrl: 'app/admin/restaurant/restaurant-view.html',
	    controller: 'AdminRestaurantCtrl',
	    controllerAs: 'adminRestaurantCtrl'
	  })
	//用户admin
	  .state('admin-customer-view', {
	    url: '/admin/customer-view?token&hasNav&retrieval&sortBy&page&itemsPerPage&search',
	    templateUrl: 'app/admin/customer/customer-view.html',
	    controller: 'AdminCustomerCtrl',
	    controllerAs: 'adminCustomerCtrl'
	  });
  });