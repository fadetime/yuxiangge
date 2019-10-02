'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('EditProductCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Upload','Auth','User','Product','Category','Compress_ready',
   function ($scope, $location, $state,$stateParams,$cookieStore,Upload,Auth,User,Product,Category,Compress_ready) {
    var self=this;
     $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };

    var hasNav = $stateParams.hasNav; 
    var token = $stateParams.token; 
    var productId = $stateParams.id;
    
    var MAX = Math.pow(2, 32);
    var MIN = 1;
    self.product={
        category:[],
        separatCategory:[],
        price:'',
        quantity:'',
        ableDiscount:false,
        info_chinese:{
            name:'',
            specificat:''
        },
        info_english:{
            name:'',
            specificat:''
        }
    };
    //默认图片
    self.defalutImage='assets/images/submit.png';
    //图片文件夹地址
    self.imageFile=imageFile;

    self.openDiscount=function(){
        self.onDiscount=!self.onDiscount;
    };

    self.discount=function(){
        self.onDiscount=false;
        self.product.ableDiscount=true;
        self.havingDiscount=self.languagePack.restaurant.manage.product.product_edit.discount;
    };

    self.noDiscount=function(){
        self.onDiscount=false;
        self.product.ableDiscount=false;
        self.havingDiscount=self.languagePack.restaurant.manage.product.product_edit.noDiscount;

    };
    var initEnvironment = function(hasNav,token){
        var system ={}; 
        var p = navigator.platform;      
        system.win = p.indexOf("Win") == 0; 
        system.mac = p.indexOf("Mac") == 0; 
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);    

        if(system.win||system.mac||system.xll){//如果是电脑跳转到百度 
            // window.location.href="http://www.baidu.com/"; 
        }else{
            $("div.contentbody").css("width","100%").css("padding-top",0).css("margin-top","100px");
            if(hasNav=="false"){
                $("div.contentbody").css("margin-top","20px");
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

    self.check=function(params){
        switch(params){
            case 'price':
                if(isNaN(self.product.price)||self.product.price<0){
                    self.priceError="Error";
                }else{
                    delete self.priceError;
                }
                break;
            case 'quantity':
                if(isNaN(self.product.quantity)||self.product.quantity<0){
                    self.quantityError="Error";
                }else{
                    delete self.quantityError;
                }
                break;
        }
    };

    var getPostParams=function(product){
        var category=[];
        var separatCategory=[];
        _.each(product.category,function (c){
            category.push(c._id);
        });
        _.each(product.separatCategory,function (c){
            separatCategory.push(c._id);
        });
        product.category=category;
        product.separatCategory=separatCategory;
        return product;
    };

    var loadProduct=function(){
        Product.show({id:productId,random:new Date().getTime()},function (data){
            var product=data.product;
            self.product={
                category:product.category,
                separatCategory:product.separatCategory,
                image:product.image,
                price:product.price,
                quantity:product.quantity,
                info_chinese:product.product_info,
                info_english:product.product_info_english
            };
            if(product.ableDiscount){
                self.havingDiscount=self.languagePack.restaurant.manage.product.product_edit.discount;
            }else{
                self.havingDiscount=self.languagePack.restaurant.manage.product.product_edit.noDiscount;
            }
            loadCategory();
            
        },function(){});
    };


    var loadCategory = function(){
        Category.index({sortBy:"seq"},function (data){
            self.categories=data.categories;
            initSeqCategory();
        },function(){

        });
    };

    var initSeqCategory=function(){
        _.each(self.product.separatCategory,function (sepCategory){
            _.each(self.categories,function (category){
                var c=_.findWhere(category.separatCategory,{_id:sepCategory._id});
                if(c){
                    sepCategory.tagName=category.showName+"-"+sepCategory.showName;
                    return false;
                }
            });
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

    var init=function (){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
        self.languagePack=languagePack;
        loadProduct();
        
    };

    //init category 选中状态
    var initCategoryState=function(){
        _.each(self.categories,function (category){
            delete category.style;
        });
    };

    //init show ,关闭所有打开的窗口
    var initShow=function(){
        self.showCategoryCell=false;
        delete self.selectCategory;
    };

    //检查所有参数，判断是否能保存
    var ableToSave=function(){
        var open=true;
        if(self.priceError||self.quantityError){
            return open=false;
        }
        return open;
    };

    initEnvironment(hasNav,token);

    //关闭打开的窗口
    self.closeShow=function(){
        initShow();
    };

    //打开新增category
    self.addCategory=function(){
        self.showCategoryCell=!self.showCategoryCell;
    };

    //鼠标移入选择
    self.enterCategory=function(category){
        self.selectCategory=category;
        initCategoryState();
        category.style="backgroundGray";
    };

    //确认选择catgory
    self.confirmCategory=function(obj,state){
        switch(state){
            case 1:
                if(self.product.category.indexOf(obj)==-1){
                    self.product.category.push(obj);
                }
                break;
            case 2:
                obj.tagName=self.selectCategory.showName+"-"+obj.showName;
                 if(self.product.separatCategory.indexOf(obj)==-1){
                    self.product.separatCategory.push(obj);
                 }
                break;
        }
        initCategoryState();
        initShow();
    };

      //检查price,quantity
    self.check=function(params){
        switch(params){
            case 'price':
                if(isNaN(self.product.price)||self.product.price<0){
                    self.priceError=self.languagePack.error.restaurant.number;
                }else{
                    delete self.priceError;
                }
                break;
            case 'quantity':
                if(isNaN(self.product.quantity)||self.product.quantity<0){
                    self.quantityError=self.languagePack.error.restaurant.number;
                }else{
                    delete self.quantityError;
                }
                break;
        }
    };
    self.splice=function(category,state){
        if(confirm(self.languagePack.restaurant.manage.product.product_edit.deleteCategoryRemind+category.showName)){
            switch(state){
                case 'category':
                    self.product.category.splice(self.product.category.indexOf(category),1);
                    break;
                case 'separatCategory':
                    self.product.separatCategory.splice(self.product.separatCategory.indexOf(category),1);
                    break;
            }
        }
        
    };

    //上传 本地
    self.upload=function(file){
        if(file.length>0){
            var file=file[0];
            if(file.size >= 1000000){
                alert('请上传小于1M的图片')
            }else{
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
                    self.product.image=filename;
                }, function (resp) {
                    alert("上传失败");
                }, function (evt) {
                    self.loaded = parseInt(100.0 * evt.loaded / evt.total);
                });
            }
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
    //                 self.product.image=filename;
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

    //保存
    self.save=function(){
        if(ableToSave()){
            self.product=getPostParams(self.product);
            Product.update({id:productId},self.product,function (data){
                if(data.code){
                    init();
                    return alert(data.msg);
                }
                if(oldLocation){
                    $location.path(oldLocation.$$path).search(oldLocation.$$search);
                }else{
                    $state.go('restaurant-products-view');
                }
                
            },function(){

            });
            // Product.create({},self.product,function (data){
            //     if(data.code){
            //         return alert(data.msg);
            //     }
            //     $state.go('restaurant-products-view');
            // },function(){

            // });
        }else{
            alert(self.languagePack.error.restaurant.product);
        }
    };

    //删除
    self.delete=function(){
        if(confirm(self.languagePack.restaurant.manage.product.product_edit.deleteRemind)){
            Product.destory({id:productId},{},function(data){
                if(oldLocation){
                    $location.path(oldLocation.$$path).search(oldLocation.$$search);
                }else{
                    $state.go('restaurant-products-view');
                }
            },function (err){
                alert(err);
            });
        }
    };
    self.createHelfProduct=function(){
        let helfProduct = {
            category: self.product.category,
            image: self.product.image,
            info_chinese: {
                name: self.product.info_chinese.name + '(半份)',
                specificat: self.product.info_chinese.name
            },
            info_english: {
                name: self.product.info_english.name + '(Half)',
                specificat: self.product.info_english.name
            },
            price: self.product.price,
            quantity: self.product.quantity,
            separatCategory: self.product.separatCategory
        }
        if(ableToSave()){
            helfProduct=getPostParams(helfProduct);
            Product.create({},helfProduct,function (data){
                if(data.code){
                    return alert(data.msg);
                }
                $state.go('restaurant-products-view');
            },function(){

            });
        }else{
            alert(self.languagePack.error.restaurant.product);
        }
    }
  }]);
