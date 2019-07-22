'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('WaiterCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth', 'Waiter','User',
  	function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Waiter,User) {
    $scope.updateLanguage = function(){
        console.log("waiter");
      init();
    };
    var self = this;

    self.waiter={
      name:'',
      authPassword:'',
      account:'',
      password:''
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;  
    self.retrieval = $stateParams.retrieval;  

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
        .search('retrieval', self.retrieval);
    };


    var loadWaiter=function(){
    	var condition={
    		page:self.pagination.page,
    		itemsPerPage:self.pagination.itemsPerPage,
        random:new Date().getTime()
    	};

      if(self.retrieval){
        condition=_.merge(condition,{retrieval:self.retrieval});
      }

    	Waiter.index(condition,function(data){
          self.waiters=data.users;
    	},function(){

    	});
    };

    var resetWaiter=function(){
        self.addWaiter=false;
        self.editWaiter=false;
        self.editPassword=false;
    };

    
    self.openEditWaiter=function(waiter){
      resetWaiter();
      self.editWaiter=true;
      self.waiter=_.clone(waiter._waiterProflie);
    };

    self.update=function(){
      if(self.waiter.name == '' && self.waiter.authPassword == ''){
        return alert("信息未变");
        init();
      }
      if(self.waiter.name == ''){
        delete self.waiter.name;
      }
      if(self.waiter.authPassword == ''){
        delete self.waiter.authPassword;
      }
      Waiter.update({id:self.waiter._id},self.waiter,function (data){
        if(data.code){
          return alert(data.msg);
        }
        init();
      },function(){

      });
    };

    self.openAddWaiter=function(){
      init();
      self.addWaiter=true;
    };

    self.openEditPassword=function(waiter){
      init();
      self.editPassword=true;
      self.waiter = waiter;
    };

    self.closeAddWaiter=function(){
      self.addWaiter=false;
    };

    self.closeEditPassword=function(){
      self.editPassword=false;
    };

    self.closeEditWaiter=function(){
      self.editWaiter=false;
    };

    self.updatePassword=function(){
      if(self.password == '' || !self.password){
        return alert(self.languagePack.restaurant.waiter.passwordNull);
      }
      User.forceToChange({id:self.waiter._id},{newPassword:self.password},function(){
        delete self.password;
        alert(self.languagePack.restaurant.waiter.editSuccess);
        init();
      },function(){

      });
    };

    self.save=function(){
        Waiter.create({},self.waiter,function (data){
          if(data.code){
            return alert(data.msg);
          }
          init();
        },function(){

        });
    };

    self.select=function(){

      doLocation();
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

    var init=function(){
      if(!languagePack){
          return;
      }
      initIntervalIdsEmpty();
      self.languagePack=languagePack;
    	resetWaiter();
      loadWaiter();
      self.waiter={};
    };

    self.delete = function (id){
        if(confirm(self.languagePack.restaurant.manage.waiter.deleteRemind)){
            Waiter.destory({id:id},{},function (){
                init();
            },function (){

            });
        }
    };

    init();


}]);

