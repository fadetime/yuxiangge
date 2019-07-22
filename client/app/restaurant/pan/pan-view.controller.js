'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewPanCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 'Pan_category', 'Compress_ready', 'Upload',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Pan_category,Compress_ready,Upload) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;

    var MAX = Math.pow(2, 32);
    var MIN = 1;

    self.pagination = {
        page: page,
        itemsPerPage: itemsPerPage,
        maxSize: 5,
        numPages: null,
        totalItems: null
    };

    self.pan_category = {
        name:'',
        name_english:'',
        image:'',
        soupTotal:'',
        subtotal:'',
    };

    //检查汤底总数和锅子价格
    self.check=function(params){
        switch(params){
            case 'soupTotal':
                if(isNaN(self.pan_category.soupTotal)||self.pan_category.soupTotal<0){
                    // console.log("xx",self.languagePack);
                    self.soupTotalError=self.languagePack.error.restaurant.number;
                }else{
                    delete self.soupTotalError;
                }
                break;
            case 'subtotal':
                if(isNaN(self.pan_category.subtotal)||self.pan_category.subtotal<0){
                    // console.log("22",self.languagePack);
                    self.subtotalError=self.languagePack.error.restaurant.number;
                }else{
                    delete self.subtotalError;
                }
                break;
        }
    };


    //检查所有参数，判断是否能保存
    var ableToSave=function(){
        var open=true;
        if(self.soupTotalError||self.subtotalError){
            return open=false;
        }
        return open;
    };



    //默认图片
    self.defalutImage='assets/images/submit.png';
    //图片文件夹地址
    self.imageFile=imageFile;

    var doLocation = function (){
      $location
        .search('page',self.pagination.page)
        .search('itemsPerPage',self.pagination.itemsPerPage);
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
        resetPan();
        loadPan_categories();
        self.loaded = 0;
        if(self.subtotalError){
            delete self.subtotalError;
        }
    };

    var loadPan_categories = function (){
        var condition = {
            itemsPerPage:self.pagination.itemsPerPage,
            page:self.pagination.page,
            isActive:"all",
            random:new Date().getTime()
        };
        Pan_category.index(condition,{},function (data){
            self.pan_categories = data.pan_categories;

            var count = data.count;
            self.pagination.totalItems = count;
            self.pagination.numPages = count/self.pagination.itemsPerPage;
        },function (){

        });
    };


    var resetPan = function (){
        self.panAdd = false;
        self.panEdit = false;
        self.pan_category = {};
    };

    self.openPanAdd = function (){
        resetPan();
        self.panAdd = true;
    };

    self.openPanEdit = function (pan_category){
        resetPan();
        self.pan_category = _.clone(pan_category);
        self.panEdit = true;
    };

    self.closePanAdd = function (){
        init();
    };

    self.closePanEdit = function (){
        init();
    };

    self.pageChanged=function(){
        doLocation();
        loadPan_categories();
    };


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
                self.pan_category.image=filename;
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
    //                 self.pan_category.image=filename;
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

    self.save = function (){
        if(ableToSave()){
             Pan_category.create({},self.pan_category,function (){
            init();
        },function (){

        });
         }else{
            alert(self.languagePack.error.restaurant.pan);
         };
       
    };

    // self.save=function(){
    //     if(ableToSave()){
    //         self.product=getPostParams(self.product);
    //         Product.create({},self.product,function (data){
    //             if(data.code){
    //                 return alert(data.msg);
    //             }
    //             $state.go('restaurant-products-view');
    //         },function(){

    //         });
    //     }else{
    //         alert("信息有误(prcie或quantity),请先修改信息");
    //     }
    // };

    self.changestate = function (pan_category){
        Pan_category.changestate({controller:pan_category._id},{isActive:!pan_category.isActive},function (data){
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function (err){
            alert(err);
        });
    };

    self.update = function (){
        if(ableToSave()){
                Pan_category.update({id:self.pan_category._id},self.pan_category,function (){
                init();
            },function (){

            });
        }else{
             alert(self.languagePack.error.restaurant.pan);
        }
        
    };

    self.delete = function (id){
        if(confirm(self.languagePack.restaurant.manage.pan.deleteRemind)){
            Pan_category.destory({id:id},{},function (){
                init();
            },function (){

            });
        }
    };

    init();
  }]);
