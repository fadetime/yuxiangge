'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('MainCtrl', ['$rootScope', '$scope', '$state', 'Auth', '$location',
    function ($rootScope, $scope, $state, Auth, $location) {
      var redirect = function () {
        if (Auth.isAdmin()) {
          $state.go('admin-restaurant-view');
        } else if (Auth.isRestaurant()) {
          $state.go('restaurant-products-view');
        } else {
          $location.path('/login');
        }
        
      };
      if(!Auth.isLoggedIn()&&Auth.getToken()){
        Auth.setCurrentUser(function (currentUser){
          redirect();
        });
      }else{
        redirect();
      }
  }]);
