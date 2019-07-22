'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('AdminRestaurantCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth', 'Restaurant','User',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Restaurant,User) {
    $scope.updateLanguage = function(){
      init();
    };
    var self = this;

    self.restaurant={
      name:'',
      account:'',
      password:''
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30; 
    self.search = $stateParams.search;  
    self.retrieval = $stateParams.retrieval;
    var hasNav = $stateParams.hasNav;
    var token = $stateParams.token;
    var sortBy = $stateParams.sortBy;

    self.pagination = {
      page: page,
      itemsPerPage: itemsPerPage,
      maxSize: 5,
      numPages: null,
      totalItems: null
    };

    var doLocation=function(){
        $location
        .search('page', self.pagination.page)
        .search('itemsPerPage', self.pagination.itemsPerPage)
        .search('sortBy',self.sortBy)
        .search('retrieval',self.retrieval)
        .search('search', self.search)
        .search('hasNav', hasNav)
        .search('token', token);
        cloneLocation();
    };

    var cloneLocation=function(){
        oldLocation=_.clone($location);
    };

    var loadRestaurant=function(){
      var condition={
        page:self.pagination.page,
        itemsPerPage:self.pagination.itemsPerPage,
        sortBy:self.sortBy,
        retrieval:self.retrieval

      };

      Restaurant.index(condition,function(data){
          self.restaurants=data.users;
      },function(){

      });
    };

    var resetRestaurant=function(){
        self.restaurant={};
        self.addRestaurant=false;
        self.editPassword=false;
    };

    
 

    self.update=function(){
      Restaurant.update({id:self.restaurant._id},self.restaurant,function(){
        init();
      },function(){

      });
    };

    self.openAddRestaurant=function(){
      resetRestaurant();
      self.addRestaurant=true;
    };

    self.openEditPassword=function(restaurant){
      resetRestaurant();
      self.editPassword=true;
      self.restaurant = restaurant;
    };

    self.closeAddRestaurant=function(){
      self.addRestaurant=false;
    };

    self.closeEditPassword=function(){
      self.editPassword=false;
    };

    self.updatePassword=function(){
      if(!self.restaurant.password){
        return alert('密码不能为空!');
      }
      User.forceToChange({id:self.restaurant._id},{newPassword:self.restaurant.password},function(){
        alert('密码修改成功!');
        init();
      },function(){

      });
    };

    self.save=function(){
        Restaurant.create({},self.restaurant,function (data){
          if(data.code){
            return alert(data.msg);
          }
          init();
        },function(){

        });
    };

    var init=function(){
      if(!languagePack){
          return;
      }
      self.languagePack=languagePack;
      resetRestaurant();
      loadRestaurant();
      cloneLocation();
      
    };

    //根据账号查询
    self.select=function(){
        self.pagination.page=1;
        doLocation();
    };

    init();


}]);

