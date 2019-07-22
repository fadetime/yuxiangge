'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewExtraCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','Extra',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Extra) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;  

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
        .search('itemsPerPage', self.pagination.itemsPerPage);
    };

    var loadExtras=function(){
        var condition={
            page:self.pagination.page,
            itemsPerPage:self.pagination.itemsPerPage,
            isActive:"all",
            random:new Date().getTime()
        };
        Extra.index(condition,function (data){
            self.extras=data.extras;
            var totalItems = data.count;
            self.pagination.totalItems = totalItems;
            self.pagination.numPages = totalItems / itemsPerPage;
        },function(){

        });
    };

    var resetShow = function (){
        self.showAdd = false;
        self.showEdit = false;
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
        loadExtras();
        resetShow();
        self.addExtra={};
        delete self.selectedExtra;
        delete self.editPriceError;
        delete self.addPriceError;
        if(self.editPriceError){
            delete self.editPriceError;
        }
    };
    init();

    
    self.openShowAdd = function (){
        resetShow();
        self.showAdd = true;
    };

    self.openShowEdit = function (extra){
        resetShow();
        self.selectedExtra=extra;
        self.showEdit = true;
    };

    self.closeShowAdd = function (){
        
        self.showAdd = false;
        init();
    };
     //检查所有参数，判断是否能保存
    var ableToSave=function(){
        var open=true;
        if(self.editPriceError){
            return open=false;
        }
        return open;
    };
    self.closeShowEdit = function (){
        self.showEdit = false;
    };

    //修改产品状态
    self.changeActive=function(extra){
        Extra.changestate({controller:extra._id},{isActive:!extra.isActive},function (data){
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function (err){
            alert(err);
        });
    };

    //检查price,quantity
    self.checkEdit=function(){
        if(isNaN(self.selectedExtra.price)||self.selectedExtra.price<0){
            self.editPriceError=self.languagePack.error.extra;
        }else{
            delete self.editPriceError;
        }
    };

    self.saveEdit=function(){
        if(ableToSave()){
                 
            Extra.update({id:self.selectedExtra._id},self.selectedExtra,function (data){
                
                if(data.code){
                    return alert(data.msg);
                }
                init();
                
            },function(){

            });
        }else{
            alert(self.languagePack.error.restaurant.extra)
        }
       
    };

    //检查price,quantity
    self.checkAdd=function(){
        if(isNaN(self.addExtra.price)||self.addExtra.price<0){
            self.addPriceError=self.languagePack.error.restaurant.number;
        }else{
            delete self.addPriceError;
        }
    };

    self.saveAdd=function(){
        if(self.addPriceError){
            return alert(self.languagePack.error.restaurant.extra);
        }
        Extra.create({},self.addExtra,function (data){
            
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function(){

        });
    };




    self.delete = function (id){
        if(confirm(self.languagePack.restaurant.manage.extra.deleteRemind)){
            Extra.destory({id:id},{},function (){
                init();
            },function (){

            });
        }
    };
  }]);
