'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};


    $scope.login = function(form) {
      $scope.error=false;
      $scope.otherError=false;
      if($scope.user.account==""||!$scope.user.account||$scope.user.password==""||!$scope.user.password){
          $scope.error=true;
      }else{
        Auth.login({
          account: $scope.user.account,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.msg;
          $scope.otherError=true;
        });
      }
    };



  });
