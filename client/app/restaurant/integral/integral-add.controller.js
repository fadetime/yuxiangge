'use strict';

angular.module('kuaishangcaiwebApp')
.controller('IntegralAddCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order',
function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order) {
	var self=this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
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
    };


    self.submit=function (){
        Order.bindAccount({b:self.doNumber},{account:self.account},function (data){
            if(data.code){
                return alert(data.msg);
            }
            alert('success');
            self.doNumber='';
            self.account='';
        },function (){

        });
    };

    init();
}]);
