'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('StatisticCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','Order', 
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Order) {
    var self = this;
    $scope.updateLanguage = function(){
      init();
    };

    var hasNav = $stateParams.hasNav; 
    var token = $stateParams.token; 
    var startTime = $stateParams.startTime;
    var endTime = $stateParams.endTime;
    

    if(isNaN(startTime)){
      self.startTime=new Date().setHours(11);
      self.startTime=new Date(self.startTime).setMinutes(0);
      self.startTime=new Date(self.startTime).setSeconds(0);
    }else{
      self.startTime=new Date(parseInt(startTime));
    }

    if(isNaN(endTime)){
      self.endTime=new Date();
    }else{
      self.endTime=new Date(parseInt(endTime));
    }
    if(self.startTime > self.endTime){
      self.startTime =new Date(self.startTime).setDate(new Date(self.startTime).getDate()-1);
    }
    self.showStartTime=false;
    self.showEndTime=false;
  	var doLocation = function (){
      $location
        .search('startTime',new Date(self.startTime).getTime())
        .search('endTime',new Date(self.endTime).getTime())
        .search('hasNav', hasNav)
        .search('token', token);
    };

    var loadStatistic = function(){
      var condition={
        startTime:new Date(self.startTime).getTime(),
        endTime:new Date(self.endTime).getTime()
      };
      if(self.state){
        condition=_.merge(condition,{state:'export'});
      }
      Order.statistic(condition,{},function (data){
        self.statistic=data.statistic;
      },function(){

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
      loadStatistic();
  	};

    self.select=function (){
      doLocation();
    };

    var initEnvironment = function(hasNav,token){
        var system ={}; 
        var p = navigator.platform;      
        system.win = p.indexOf("Win") == 0; 
        system.mac = p.indexOf("Mac") == 0; 
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);    
        var browser_width = $(document.body).width()*0.782*0.8;

        if(system.win||system.mac||system.xll){//如果是电脑跳转到百度 
            // window.location.href="http://www.baidu.com/"; 
        }else{
            $("div.content_body").css("width","100%").css("padding-top",0).css("margin-top","100px");
            if(hasNav=="false"){
                $("div.content_body").css("margin-top","20px");
            }
        }

      if(token){
          $cookieStore.put('token', token);
          // alert(Auth.getToken());
          Auth.setCurrentUser(function (currentUser){
              init();
          });
      }else{
          init();
      }
    };

    initEnvironment(hasNav,token);
    

  }]);
