'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('EditSoupCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth', 'Attribute', 'Upload', 'Compress_ready', 'Pan_soup',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,Attribute,Upload,Compress_ready,Pan_soup) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var id = $stateParams.id;

    // self.chooseTasteImg = "background: url(assets/images/chooseNo.png);";

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
                self.pan_soup.image=filename;
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
    //                 self.pan_soup.image=filename;
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
    	loadPan_soup();
    };

    var initPan_soup = function (){
    	// self.attributes = self.pan_soup.attribute;
    	// console.log();
     //    _.each(self.attributes,function (attribute){
     //        attribute.isSelect = true;
     //        _.each(attribute.value,function (v){
     //        	if(v.isDefault){
     //        		v.style = "selecttaste";
     //        	}else{
     //        		v.style = "";
     //        	}
     //        });
     //    });
    	_.each(self.pan_soup.attribute,function (attr){
    		_.each(self.attributes,function (attr2){
    			if(attr._id == attr2._id){
    				attr2.isSelect = true;
    				var isDefault = _.findWhere(attr.value,{isDefault:true});
    				var value = _.findWhere(attr2.value,{_id:isDefault._id});
    				value.style = "selecttaste";
    			}
    		});
    	});

    };

    var loadPan_soup = function (){
    	Pan_soup.show({id:id,random:new Date().getTime()},{},function (data){
    		self.pan_soup = data.pan_soup;
    		// initPan_soup();
    		loadAttributes();
    	},function (){

    	});
    };

    var loadAttributes  = function (){
    	Attribute.index({random:new Date().getTime()},{},function (data){
    		self.attributes = data.attributes;
            _.each(self.attributes,function (attribute){
                attribute.isSelect = false;
                _.each(attribute.value,function (v){
                    v.style = "";
                });
            });
            initPan_soup();
    	},function (){

    	});
    };

    var getParams=function(attributes){
        var result=[];
        _.each(attributes,function (attribute){
            var attr={
            	_id:attribute._id,
                name:attribute.name,
                name_english:attribute.name_english,
                value:attribute.value
            };
            _.each(attr.value,function (v){
                if(v.style){
                    v.isDefault=true;
                }else{
                    v.isDefault=false;
                }
            });
            result.push(attr);
        });
        return result;
    };

    self.chooseTasteValue = function (v,attribute){
        if(v.style == "selecttaste"){
            v.style = "";
        }else{
            _.each(attribute.value,function (v){
                v.style = "";
            });
            attribute.isSelect = true;
            v.style = "selecttaste";
        }
    };

    self.update = function (){
        var arr=[];
        _.each(self.attributes,function (attribute){
            if(attribute.isSelect){
                arr.push(attribute);
            }
        });
        var attr=getParams(arr);
        self.pan_soup.attribute=attr;
        // if(attr.length>0){
        //     self.pan_soup.attribute=attr;
        // }else{
        //     self.pan_soup.attribute='';
        // }
        Pan_soup.update({id:id},self.pan_soup,function (data){
        	if(data.code){
                init();
                return alert(data.msg);
            }
            if(oldLocation){
                $location.path(oldLocation.$$path).search(oldLocation.$$search);
            }else{
                $state.go("restaurant-soups-view");
            }
        },function (){

        });
    };

    self.delete = function (id){
        if(confirm(self.languagePack.restaurant.manage.pan.deleteRemind)){
            Pan_soup.destory({id:id},{},function (){
                if(oldLocation){
                    $location.path(oldLocation.$$path).search(oldLocation.$$search);
                }else{
                    $state.go('restaurant-soups-view');
                }
            },function (){

            });
        }
    };
    
    init();
  }]);