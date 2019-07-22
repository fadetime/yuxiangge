'use strict';

angular.module('kuaishangcaiwebApp')
.controller('PrinterAddCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Category','Printer',
function ($scope, $location, $state,$stateParams,$cookieStore,Category,Printer) {
	var self=this;
    $scope.updateLanguage = function(){
      init();
    };
    self.printer = {
    	name:'',
		isPrintOrder:false,
		isPrintPanAndSoup:false,
		isPrintProduct:false,
		productCategory:[]
    };

    self.isSelectOrder = false;
    self.isSelectPanAndSoup = false;
    self.isSelectProduct = false;

    var loadCategories = function (){
    	Category.index({},{},function (data){
    		self.categories = data.categories;
    		_.each(self.categories,function (category){
    			category.isSelect = 'noChooseCatrgory';
    			 category.flag = false;
    		});
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

    var init = function (){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
        self.languagePack=languagePack;
    	loadCategories();
    };

    self.isSelectProductCategory = function (category){
    	category.flag = !category.flag;
    	if(category.flag){
    		category.isSelect = 'hasChooseCatrgory';
    		self.printer.productCategory.push(category._id);
    	}else{
    		category.isSelect = 'noChooseCatrgory';
    		self.printer.productCategory.splice(self.printer.productCategory.indexOf(category._id),1);
    	}
    };

    self.save = function (){
    	var printer = {
	    	name:self.printer.name,
			isPrintOrder:self.isSelectOrder,
			isPrintPanAndSoup:self.isSelectPanAndSoup,
			isPrintProduct:self.isSelectProduct,
            isPrintReduce:self.isSelectReduce,
			productCategory:self.printer.productCategory
	    };
	    Printer.create({},printer,function (){
	    	$state.go('restaurant-printers-view');
	    },function (){

	    });
    };
    
    init();
}]);
