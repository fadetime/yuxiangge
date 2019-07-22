'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('AdminCustomerCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','User', 'Customer',
    function ($scope, $location, $state,$stateParams,$cookieStore,User,Customer) {
    $scope.updateLanguage = function(){
      init();
    };
    var self = this;

    self.customer={
      name:'',
      account:'',
      password:''
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;  
    self.sortBy = $stateParams.sortBy;
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
    var loadCustomer=function(){
      var condition={
        page:self.pagination.page,
        itemsPerPage:self.pagination.itemsPerPage,
        sortBy:self.sortBy,
        retrieval:self.retrieval
      };


      Customer.index(condition,function(data){
          self.customers=data.users  ;
      },function(){

      });
    };

    var resetCustomer=function(){
        self.addCustomer=false;
        self.editCustomer=false;
        self.editPassword=false;
        self.customer = {};
    };

    
    self.openEditCustomer=function(customer){
      resetCustomer();
      self.editCustomer=true;
      self.customer=_.clone(customer._customerProflie);
    };

    self.update=function(){
      Customer.update({id:self.customer._id},self.customer,function(){
        init();
      },function(){

      });
    };

    self.openAddCustomer=function(){
      resetCustomer();
      self.addCustomer=true;
    };



    self.openEditPassword=function(customer){
      resetCustomer();
      self.editPassword=true;
      self.customer = customer;
    };

    self.closeAddCustomer=function(){
      self.addCustomer=false;
    };

    self.closeEditPassword=function(){
      self.editPassword=false;
    };

    self.closeEditCustomer=function(){
      self.editCustomer=false;
    };

    self.updatePassword=function(){
      if(!self.customer.password){
        return alert('密码不能为空!');
      }
      User.forceToChange({id:self.customer._id},{newPassword:self.customer.password},function(){
        alert('密码修改成功!');
        init();
      },function(){

      });
    };

    self.save=function(){
        Customer.create({},self.customer,function (data){
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
      resetCustomer();
      loadCustomer();
      self.customer={};
    };

    //根据账号查询
    self.select=function(){
        self.pagination.page=1;
        doLocation();
    };

    init();


}]);

