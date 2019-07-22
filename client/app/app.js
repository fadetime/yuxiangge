'use strict';

var oldLocation;//记录有必要记录的历史记录
var languagePack;
var openPrint=true;
var orderIntervalIds=[];
var productIntervalIds=[];
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

angular.module('kuaishangcaiwebApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'ngFileUpload'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/login');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        if (config.url.match(/^\/(auth|api)/)) {
          config.headers = config.headers || {};
          if ($cookieStore.get('token')) {
            config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
          }
          if(languagePack&&languagePack.edition=="english"){
            config.headers.language = "english";
          }else{
            config.headers.language = "chinese";
          }
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401 ) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        
        else {
          return $q.reject(response);
        }
      }
    };
  })
  .service('Compress_ready', function($q) {

    var dataURItoBlob = function(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);
   
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
   
      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
   
      return new Blob([ia], {
        type: mimeString
      });
    };
   
    var resizeFile = function(file) {
      
      var deferred = $q.defer();
      var img = document.createElement("img");
      try {
        var reader = new FileReader();
        reader.onload = function(e) {
          img.src = e.target.result;
          //resize the image using canvas
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          var MAX_WIDTH = 800;
          var MAX_HEIGHT = 480;
          var width = img.width;
          var height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
   
          //change the dataUrl to blob data for uploading to server
          var dataURL = canvas.toDataURL('image/png');
          var blob = dataURItoBlob(dataURL);
   
          deferred.resolve(blob);
        };
        reader.readAsDataURL(file);
      } catch (e) {
        deferred.resolve(e);
      }
      return deferred.promise;
   
    };
    return {
      resizeFile: resizeFile
    };
   
  })
  //控制器通信
  .directive('loader',function(){
    return{
        restrict:'AE',
        // replace : true,
        // transclude : true,
        link:function(scope,element,attrs){
            element.bind('mouseenter',function(){
              // console.log('s');
              scope.changePack = function(pack){
                // console.log('sss');
                scope.loadLanguage(pack, scope.updateLanguage);
                // scope.updateLanguage();

              };
              
            })
        }
    }
  })

  .run(['$rootScope', '$location','Auth', 'Language', function ($rootScope, $location, Auth , Language) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if(languagePack){
        Auth.isLoggedInAsync(function(loggedIn) {
          if (next.authenticate && !loggedIn) {
            $location.path('/login');
          } else {
            $rootScope.$broadcast('loggedIn');
          }
        });
      }else{
        Language.getPack({pack:'chinese'},{},function (data){
          languagePack = data;
          Auth.isLoggedInAsync(function(loggedIn) {
            if (next.authenticate && !loggedIn) {
              $location.path('/login');
            } else {
              $rootScope.$broadcast('loggedIn');
            }
          });

        });
      }
      
    });
  }]);
