'use strict';

angular.module('kuaishangcaiwebApp')
.controller('PrinterViewCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Printer',
function ($scope, $location, $state,$stateParams,$cookieStore,Printer) {
	var self=this;
    $scope.updateLanguage = function(){
      init();
    };
    var loadPrinters = function (){
    	Printer.index({isDetail:true},{},function (data){
    		self.printers = data.prints;
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
    	loadPrinters();
    };

    init();
}]);
