'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('PersonalViewCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Restaurant','Upload','Compress_ready',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Restaurant,Upload,Compress_ready) {
    var self = this;

    $scope.updateLanguage = function(){
      init();
    };

    var state = $stateParams.state;  
    var MAX = Math.pow(2, 32);
    var MIN = 1;

    //默认图片
    self.defalutImage='assets/images/submit.png';
    //图片文件夹地址
    self.imageFile=imageFile;

    var doLocation=function(){
        $location
        .search('state', state);
    };

    var reset = function (){
    	self.showRestaurantNotice = false;
    	self.showIntegralChange = false;
    	self.showChangePassword = false;
    	self.showChangeRestaurantInfo = false;
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
        self.restaurant=Auth.getCurrentUser();
        if(!self.restaurant.account){
            loadRestaurant();
        }
    	
    	reset();
    	switch(state){
    		case 'integralChange':
    			self.showIntegralChange = true;
    			break;
    		case 'changePassword':
    			self.showChangePassword = true;
    			break;
    		case 'changeRestaurantInfo':
    			self.showChangeRestaurantInfo = true;
    			break;
    		default:
    			self.showRestaurantNotice = true;
    	};
    };

    var loadRestaurant = function (){
    	User.get({},{},function (data){
    		self.restaurant = data;
    		self.cloneLogo = _.clone(data._restaurantProflie.logo);
    	},function (){

    	});
    };

    //上传 本地
    self.upload=function(file){
        if(file.length>0){
            var file=file[0];
            var now = new Date().getTime();
            var nowStr = now.toString();
            var rand = (Math.floor(Math.random() * (MAX - MIN)) + MIN).toString();
            var randStr = rand.toString();
            var filename = nowStr + '_' + randStr + '_' + file.name.replace(/[^0-9a-z\.]+/gi, '');
            Upload.upload({
                method: 'POST',
                url: 'api/upload',
                data: {file: file, 'filename': filename}
            }).then(function (resp) {
                if(resp.data.code!=700){
                    return alert(resp.data.msg);
                }
                self.restaurant._restaurantProflie.logo=filename;
            }, function (resp) {
                alert("上传失败");
            }, function (evt) {
                self.loaded = parseInt(100.0 * evt.loaded / evt.total);
            });
       };
    };

    // //上传aws
    // self.upload = function (files) {

    //   var now = new Date().getTime();
    //   var nowStr = now.toString();
    //   var rand = (Math.floor(Math.random() * (MAX - MIN)) + MIN).toString();
    //   var randStr = rand.toString();

    //   if (files.length === 1) {
    //     var file = files[0];
    //     var filename = nowStr + '_' + randStr + '_' + file.name.replace(/[^0-9a-z\.]+/gi, '');
    //     var index=0;//尝试次数
    //     var doCompress=function(){
    //         Compress_ready.resizeFile(file).then(function(blob_data) {
    //             if(blob_data.size==0){
    //                 //尝试次数为1次，则再尝试压缩，否则报错
    //                 if(index==0){
    //                     index++;
    //                     return doCompress();
    //                 }else{
    //                     return alert(self.languagePack.error.imageError.compressError);
    //                 }
    //             }

    //             Upload.upload({
    //               url: self.imageFile, //S3 upload url including bucket name
    //               //url: 'https://easybuy-products.s3-ap-southeast-1.amazonaws.com/',
    //               method: 'POST',
    //               fields : {
    //                 key: filename, // the key to store the file on S3, could be file name or customized
    //                 AWSAccessKeyId: 'AKIAISQS2OXGGEEWLPMA',
    //                 acl: 'public-read', // sets the access to the uploaded file in the bucket: private or public
    //                 policy: 'ewogICAgImV4cGlyYXRpb24iOiAiMjAyMC0wMS0wMVQwMDowMDowMFoiLAogICAgImNvbmRpdGlvbnMiOiBbCiAgICAgICAgeyJidWNrZXQiOiAiZGlhbmRpYW4tZGV2In0sCiAgICAgICAgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgIiJdLAogICAgICAgIHsiYWNsIjogInB1YmxpYy1yZWFkIn0sCiAgICAgICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgICAgIFsic3RhcnRzLXdpdGgiLCAiJGZpbGVuYW1lIiwgIiJdLAogICAgICAgIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCA1MjQyODgwMDBdCiAgICBdCn0=', // base64-encoded json policy (see article below)
    //                 signature: 'znqUgZJa54MSmC2MHwGVNtC5CsY=', // base64-encoded signature based on policy string (see article below)
    //                 'Content-Type': file.type !== '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
    //                 filename: filename // this is needed for Flash polyfill IE8-9
    //               },
    //               file: blob_data,
    //             }).then(function () {
    //                 self.restaurant._restaurantProflie.logo=filename;
    //             }, function () {

    //             }, function (evt) {
    //               self.loaded = parseInt(100 * evt.loaded / evt.total, 10);
    //               // console.log('progress: ' + self.loaded + '% file :'+ evt.config.file.name);
    //             });

    //         }, function(err_reason) {
    //           console.log(err_reason);
    //         });
    //     };

    //     doCompress();
        
    //   }
    // };

    //右侧栏框框切换
    self.openShowRestaurantNotice = function (){
    	state = 'restaurantNotice';
    	doLocation();
    };

    self.openShowIntegralChange = function (){
    	state = 'integralChange';
    	doLocation();
    };

    self.openShowChangePassword = function (){
    	state = 'changePassword';
    	doLocation();
    };

    self.openShowChangeRestaurantInfo = function (){
    	state = 'changeRestaurantInfo';
    	doLocation();
    };

    //保存
    var restaurant;
    var updateRestaurant = function (cb,errorCb){
    	Restaurant.update({},restaurant,function (data){
    		cb(data);
    	},function (data){
    		errorCb(data);
    	});
    };

    self.saveRestaurantNotice = function (){
    	restaurant = {
    		notice:self.restaurant._restaurantProflie.notice,
            integralRule:self.restaurant._restaurantProflie.integralRule
    	};
    	updateRestaurant(function(){
    		alert(self.languagePack.restaurant.personal.success);
    	},function (data){
    		alert(data);
    	});
    };

    self.saveIntegralChange = function (){
    	restaurant = {
    		ratio:self.restaurant._restaurantProflie.ratio,
            gstPercent:self.restaurant._restaurantProflie.gstPercent,
            servicePercent:self.restaurant._restaurantProflie.servicePercent
    	};
    	updateRestaurant(function (data){
            if(data.code){
                alert(data.msg);
            }else{
                alert(self.languagePack.restaurant.personal.success);
            }
    		
    	},function (data){
    		alert(data);
    	});
    };

    self.saveChangeRestaurantInfo = function (){
    	restaurant = {
    		name:self.restaurant._restaurantProflie.name,
    		logo:self.restaurant._restaurantProflie.logo,
            address:self.restaurant._restaurantProflie.address,
            tel:self.restaurant._restaurantProflie.tel
    	};
    	if(self.loaded>0 && self.cloneLogo == self.restaurant._restaurantProflie.logo){
    		return alert(self.languagePack.restaurant.personal.waiter);
    	}
    	updateRestaurant(function(){
    		alert(self.languagePack.restaurant.personal.success);
    		delete self.loaded;
    		self.cloneLogo = self.restaurant._restaurantProflie.logo;
    	},function (data){
    		alert(data);
    	});
    };

    self.saveChangePassword = function (){
    	var password = {
    		oldPassword:self.oldPassword,
    		newPassword:self.newPassword
    	};
    	User.changePassword({id:self.restaurant._restaurantProflie._id},password,function (){
            alert(self.languagePack.restaurant.personal.success);
            delete self.oldPassword;
            delete self.newPassword;
    	},function (data){
    		if(data.status == '403'){
    			alert(self.languagePack.restaurant.personal.errPassword);
    		}
    	});
    };

    

    init();
  }]);
