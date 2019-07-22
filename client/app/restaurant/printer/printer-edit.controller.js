'use strict';

angular.module('kuaishangcaiwebApp')
.controller('PrinterEditCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Printer','Category',
function ($scope, $location, $state,$stateParams,$cookieStore,Printer,Category) {
	var self=this;
    $scope.updateLanguage = function(){
      init();
    };
    var printerId = $stateParams.id;

    var loadPrinter = function (){
    	Printer.show({id:printerId},{},function (data){
    		self.printer = data.print;
    		self.isSelectOrder=data.print.isPrintOrder;
			self.isSelectPanAndSoup=data.print.isPrintPanAndSoup;
			self.isSelectProduct=data.print.isPrintProduct;
            self.isSelectReduce=data.print.isPrintReduce;
			self.isActivePrinter=data.print.isActive;
			self.productCategory = data.print.productCategory;
			loadCategories();
    	},function (){

    	});
    };

    var loadCategories = function (){
    	Category.index({},{},function (data){
    		self.categories = data.categories;
    		_.each(self.categories,function (category){
    			var c = self.productCategory.indexOf(category._id);
    			if(c<0){
    				category.isSelect = 'noChooseCatrgory';
    				category.flag = false;
    			}else{
    				category.isSelect = 'hasChooseCatrgory';
    				category.flag = true;
    			}
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
    	loadPrinter();
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


    self.update = function (){
    	var printer = {
	    	name:self.printer.name,
			isPrintOrder:self.isSelectOrder,
			isPrintPanAndSoup:self.isSelectPanAndSoup,
			isPrintProduct:self.isSelectProduct,
            isPrintReduce:self.isSelectReduce,
			isActive:self.isActivePrinter,
			productCategory:self.printer.productCategory
	    };
	    Printer.update({id:printerId},printer,function (){
	    	$state.go('restaurant-printers-view');
	    },function (){

	    });
    };

    self.destroy=function (){
        if(confirm(self.languagePack.restaurant.manage.product.product_edit.deleteRemind)){
            Printer.destroy({id:printerId},{},function (){
                $state.go('restaurant-printers-view');
            },function (){

            });
        }
    };
    

    init();
}]);
