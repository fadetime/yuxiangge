'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('NavbarCtrl', ['$scope', '$location', '$state','$stateParams', 'Auth','User','Language', function ($scope, $location, $state,$stateParams, Auth, User,Language) {
    var self = this;
    $scope.loadLanguage = function(pack, updateLanguage){
      Language.getPack({pack:pack},{},function (data){
        languagePack = data;
        init();
        updateLanguage();
      },function (){

      });
    };

    self.language = true;

    //图片文件夹地址
    self.imageFile=imageFile;
    
    var system ={}; 
    var p = navigator.platform;      
    system.win = p.indexOf("Win") == 0; 
    system.mac = p.indexOf("Mac") == 0; 
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);   
    var hasNav = $stateParams.hasNav; 
    if(system.win||system.mac||system.xll){//如果是电脑跳转到百度 
        // window.location.href="http://www.baidu.com/"; 
        console.log("baidu");
    }else{  //如果是手机,跳转到谷歌
        // window.location.href="http://www.google.cn/"; 
        if(hasNav=="false"){
        	$("div.hasNav").css("display","none");
        }
        
    }

    var init = function (){
      if(!languagePack){
        Language.getPack({pack:'chinese'},{},function (data){
          // console.log('1111');
          languagePack = data;
          // console.log(languagePack);
          $scope.updateLanguage();
          self.languagePack=languagePack;
          menu();
        });
      }else{
        self.languagePack=languagePack;
        menu();
      }
        
    };

    var menu = function (){
      Auth.setCurrentUser( function (currentUser){
        
        var role=currentUser.role;
        if(role=="restaurant"){
          document.title=currentUser._restaurantProflie.name;
          self.logo=currentUser._restaurantProflie.logo;
        }else{
          document.title="admin";
        }
        
        switch(role){
          case "admin":
            self.menu =self.languagePack.navbar.admin;
            break;
          case "restaurant":
            self.menu = self.languagePack.navbar.restaurant;
            break;
        }
        initMenuStatus();
      });
        
        
    };

    var initMenuStatus=function(){
      _.each(self.menu,function (menu){
        delete menu.style;
        _.each(menu.content,function (content){
          delete content.style;
        });
      });
      var navValue = $stateParams.navValue;
      // console.log(navValue);
      var c=_.findWhere(self.menu,{state:navValue});

      if(c){
        c.style="unique_color";
        if(c.content){
          c.content[0].style="navOrange";
        }
        return ;
      }
      _.each(self.menu,function (menu){
        // console.log("xx");
        // console.log(navValue);
        var c=_.findWhere(menu.content,{state:navValue});
        if(c){
          c.style="navOrange";
          menu.style="unique_color";
          return false;
        }
      });
    };

    self.logout = function (){
      Auth.logout();
    };

    self.changeLanguage = function (){
      self.showOther = false;
      self.language = !self.language;
      console.log(self.language);
      if(self.language){
        $scope.changePack('chinese');
      }else{
        $scope.changePack('english');
      }
      
    };
    
    init();
  }]);
