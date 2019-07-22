'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewSoupCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 'Pan_soup',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Pan_soup) {
    
     //记录本次操作
    oldLocation=_.clone($location);
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var self = this;
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;

    self.pagination = {
        page: page,
        itemsPerPage: itemsPerPage,
        maxSize: 5,
        numPages: null,
        totalItems: null
    };
    //图片文件夹地址
    self.imageFile=imageFile;

    var doLocation = function (){
      $location
        .search('page',self.pagination.page)
        .search('itemsPerPage',self.pagination.itemsPerPage);
    };


    var loadPan_soups = function (){
    	var condition = {
            itemsPerPage:self.pagination.itemsPerPage,
            page:self.pagination.page,
            isActive:"all",
            random:new Date().getTime()
        };
        Pan_soup.index(condition,{},function (data){
            self.pan_soups = data.pan_soups;

            
            _.each(self.pan_soups,function (pan_soup){
                pan_soup.tasteDescribe = [];
                _.each(pan_soup.attribute,function (attr){
                    pan_soup.tasteDescribe.push(attr.showName);
                });
            });

            var count = data.count;
            self.pagination.totalItems = count;
            self.pagination.numPages = count/self.pagination.itemsPerPage;
        },function (){

        });
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
  	
    var init  = function (){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
        self.languagePack=languagePack;
    	loadPan_soups();
    };

    self.pageChanged=function(){
        doLocation();
        loadPan_soups();
    };

    self.changestate = function (pan_soup){
        Pan_soup.changestate({controller:pan_soup._id},{isActive:!pan_soup.isActive},function (data){
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function (err){
            alert(err);
        });
    };
    
    init();
  }]);
