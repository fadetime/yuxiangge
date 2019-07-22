'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewTasteCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth', 'User','Attribute',
  	function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Attribute) {
    $scope.updateLanguage = function(){
        // console.log("waiter");
      init();
    };
    var self = this;

    var loadAttributes=function (){
      Attribute.index({},{},function (data){
        self.attributes=data.attributes;
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

    var init=function(){
      if(!languagePack){
          return;
      }
      initIntervalIdsEmpty();
      self.languagePack=languagePack;
      loadAttributes();
      self.attribute={
        name:'',
        name_english:'',
        value:[{
          name:'',
          name_english:''
        }]
      };
    };

    self.addMore=function (){
      var obj={
        name:'',
        name_english:''
      };
      self.attribute.value.push(obj);
    };

    self.save=function (){
      var length=self.attribute.value.length;
      console.log(self.attribute);
      for(var i=0;i<length;i++){
        if(self.attribute.value[i].name==''&&self.attribute.value[i].name_english==''){
          self.attribute.value.splice(i,1)
        }else if(self.attribute.value[i].name=='' || self.attribute.value[i].name_english==''){
          return alert('信息不完整');
        }
      }
      console.log(self.attribute);
      Attribute.create({},self.attribute,function (data){
        if(data.code){
          return alert(data.msg);
        }
        self.showAddTasteBox=false;
        init();
      },function (){

      });
    };

    self.destroyAll=function (){
      Attribute.destroyAll({},{},function (){
        init();
      },function (){

      });
    };

    init();

}]);

