'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewGiftCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','Gift','Compress_ready','Upload',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Gift,Compress_ready,Upload) {
    var self = this;
    console.log('self')
    console.log(self)
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;

    self.pagination = {
  		page: page,
  		itemsPerPage: itemsPerPage,
  		maxSize: 5,
  		numPages: null,
  		totalItems: null
  	};

  	self.gift = {
  		name:'',
  		name_english:'',
		quantity:'',
		integralPrice:'',
		image:'',
  	};
    //检查积分和库存
    self.check=function(params){
    switch(params){
        case 'integralPrice':
            if(isNaN(self.gift.integralPrice)||self.gift.integralPrice<0){
                self.integralPriceError=self.languagePack.error.restaurant.number;
            }else{
                delete self.integralPriceError;
            }
            break;
        case 'quantity':
            if(isNaN(self.gift.quantity)||self.gift.quantity<0){
                self.quantityError=self.languagePack.error.restaurant.number;
            }else{
                delete self.quantityError;
            }
            break;
        }
    };

    var ableToSave=function(){
        var open=true;
        if(self.integralPriceError||self.quantityError){
            return open=false;
        }
        return open;
    };
    

  	var doLocation=function(){
        $location
        .search('page', self.pagination.page)
        .search('itemsPerPage', self.pagination.itemsPerPage);
    };

  	var MAX = Math.pow(2, 32);
    var MIN = 1;

    //默认图片
    self.defalutImage='assets/images/submit.png';
    //图片文件夹地址
    self.imageFile=imageFile;

    //上传
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
                console.log();
                if(resp.data.code!=700){
                    return alert(resp.data.msg);
                }
                self.gift.image=filename;
            }, function (resp) {
                alert("上传失败");
            }, function (evt) {
                self.loaded = parseInt(100.0 * evt.loaded / evt.total);
            });
       };
    };

    // // 上传aws
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
    //                     return alert("压缩图片失败,请再次尝试上传");
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
    //                 self.gift.image=filename;
    //             }, function () {

    //             }, function (evt) {
    //               self.loaded = parseInt(100 * evt.loaded / evt.total, 10);
    //               // console.log('progress: ' + self.loaded + '% file :'+ evt.config.file.name);
    //             });

    //         }, function(err_reason) {
    //           // console.log(err_reason);
    //         });
    //     };

    //     doCompress();
        
    //   }
    // };

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
    	resert();
    	self.gift = {};
        loadGifts();
    	self.loaded = '';
        if(self.quantityError){
            delete self.quantityError
        }
    };

    var resert = function (){
    	self.giftAdd = false;
    	self.giftEdit = false;
    };

    var loadGifts = function (){
		var condition = {
			itemsPerPage:self.pagination.itemsPerPage,
			page:self.pagination.page,
			random:new Date().getTime()
		};
    	Gift.index(condition,{},function (data){
    		self.gifts = data.gifts;
	        var count = data.count;
	        self.pagination.totalItems = count;
	        self.pagination.numPages = count/self.pagination.itemsPerPage;
    	},function (){

    	});
    };

    self.openGiftAdd = function (){
    	init();
        self.giftAdd = true;
    };
    self.openGiftEdit = function (gift){
        init();
        self.giftEdit = true;
        self.gift = gift;
    };

    self.closeGiftAdd = function (){
        self.giftAdd = false;
    };
    self.closeGiftEdit = function (){
        self.giftEdit = false;
    };
    self.pageChanged=function(){
        doLocation();
        init();
    };

    self.changestate=function(gift){
        Gift.changestate({controller:gift._id},{isActive:!gift.isActive},function (data){
            console.log(gift.isActive);
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function (err){
            alert(err);
        });
    };


    self.save=function(){
        if(ableToSave()){
            Gift.create({},self.gift,function (data){
                if(data.code){
                    return alert(data.msg);
                }
                init();
            },function(){

            });
        }else{
            alert(self.languagePack.error.restaurant.gift);
        }
    };
    self.update = function (id){
    	Gift.update({id:id},self.gift,function (data){
            if(data.code){
                return alert(data.msg);
            }
    		init();
    	},function (){

    	});
    };

    self.delete=function(id){
        if(confirm(self.languagePack.restaurant.manage.gift.deleteRemind)){
            Gift.destory({id:id},{},function(data){
               init();
            },function (err){
                alert(err);
            });
        }
    };



    init();
  }]);
