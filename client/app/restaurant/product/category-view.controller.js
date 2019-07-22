'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewCategoryCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 'Category',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Category) {
    var self = this;
     $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    self.categoryState;//1.一级分类，2.二级分类
    self.readyCatgeory={};

    var getEditHeight=function(){
    	var open=true;
    	var length=0;
    	switch(self.categoryState){
    		case 1:
    			length=1;
    			break;
    		case 2:
    			length=self.selectedCategory.separatCategory.length || 0;
    			break;
    		default:
    			alert(self.languagePack.restaurant.manage.product.categories.errorState);
    			self.initOpen();
    			return open=false;
    	}
		// $("div.sortcategoryposition").css('height',length*66+80+92);
        var length=length*66*2+80+62;
        if(length<=240){
            $("div.eidtcategoryposition").css('height',240);
        }else if(length>=400){
            $("div.eidtcategoryposition").css('height',400);
            $("div.eidtcategoryposition").css('overflow','auto');
        }else{
            $("div.eidtcategoryposition").css('height',length);
        }
		
		return open;
	};

    var getSortHeight=function(){
        var open=true;
        var length=0;
        switch(self.categoryState){
            case 1:
                length=self.categories.length;
                break;
            case 2:
                length=self.selectedCategory.separatCategory.length || 0;
                break;
            default:
                alert(self.languagePack.restaurant.manage.product.categories.errorState);
                self.initOpen();
                return open=false;
        }
        var length=length*66*2+80+62;
        if(length<=240){
            $("div.sortcategoryposition").css('height',240);
        }else if(length>=400){
            $("div.sortcategoryposition").css('height',400);
            $("div.sortcategoryposition").css('overflow','auto');
        }else{
            $("div.sortcategoryposition").css('height',length);
        }
        // $("div.eidtcategoryposition").css('height',length*66*2+132);
        return open;
    };

	//获取div的宽度
	var getCellHeight=function(categories){
		_.each(categories,function (category){
			var length=category.separatCategory.length || 0;
			category.height="height:"+40*Math.ceil((length+2)/5)+"px";
		});
	};


    var loadCategory=function(){
    	Category.index({isAll:true,sortBy:"seq",random:new Date().getTime()},function (data){
    		self.categories=data.categories;
    		getCellHeight(self.categories);
    		self.initOpen();
    		
    	},function(){

    	});
    };

    //改category排序
    // var getIndexToCategory=function(){
    //     switch(self.categoryState){
    //         case 1:
    //             var index=1;
    //             _.each(self.categories,function (category){
    //                 category.index=index;
    //                 index++;
    //             });
    //             break;
    //         case 2:
    //             // init();
    //             break;
    //         default:
    //             alert("状态错误请重新添加！");
    //             self.initOpen();
    //     }

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

    var init=function(){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
    	self.languagePack=languagePack;
    	loadCategory();
    };

    //所有弹框隐藏
    self.initOpen=function(open){
    	self.showAddCategory=false;
    	self.showEditCategory=false;
    	self.showSortCategory=false;
    	delete self.selectedCategory;
        self.readyCatgeory = {};
    	self.categoryState="";
    	if(open){
    		init();
    	}
    };

    init();

    //增加分类项
    self.addCategory = function (category,state){
    	self.initOpen();
    	self.showAddCategory=true;
    	self.categoryState=state;
    	self.selectedCategory=category;
    };

    //增加
    self.add = function(){
    	if(!self.readyCatgeory.name){
    		return alert(self.languagePack.restaurant.manage.product.categories.nameError);
    	}
    	if(!self.readyCatgeory.name_english){
    		return alert(self.languagePack.restaurant.manage.product.categories.nameEnglishError);
    	}
    	switch(self.categoryState){
    		case 1:
    			self.readyCatgeory.separatCategory=[];
    			Category.create({},self.readyCatgeory,function (data){
    				if(data.code){
		                return alert(data.msg);
		            }
		            init();
    			},function(){

    			});
    			break;
    		case 2:
    			self.selectedCategory.separatCategory.push(self.readyCatgeory);
    			Category.update({id:self.selectedCategory._id},{separatCategory:self.selectedCategory.separatCategory},function (data){
    				if(data.code){
		                return alert(data.msg);
		            }
		            init();

    			},function(){

    			});
    			// init();
    			break;
    		default:
    			alert(self.languagePack.restaurant.manage.product.categories.errorState);
    			self.initOpen();
    	}
    };

    //编辑
    self.editCategory=function (category,state){
    	self.initOpen();
    	self.categoryState=state;
    	self.selectedCategory=category;
    	if(getEditHeight()){
    		self.showEditCategory=true;
    	}else{
    		self.initOpen();
    	};
    	
    };

    //删除
    self.delete=function (category){
    	switch(self.categoryState){
    		case 1:
    			if(confirm(self.languagePack.restaurant.manage.product.categories.deleteRemind)){
    				Category.destory({id:self.selectedCategory._id},function(){
    					init();
    				},function (err){
    					alert(err);
    				});
    			}
    			break;
    		case 2:
    			var separatCategory=self.selectedCategory.separatCategory;
    			separatCategory.splice(separatCategory.indexOf(category),1);
    			getCellHeight(self.categories);
    			break;
    		default:
    			alert(self.languagePack.restaurant.manage.product.categories.errorState);
    			self.initOpen();
    	}
    };

    //确定修改保存（非排序）
    self.saveEdit=function(){
    	Category.update({id:self.selectedCategory._id},self.selectedCategory,function (data){
			if(data.code){
                return alert(data.msg);
            }
            init();
		},function(){

		});
    };

    //打开排序
    self.sortCategory=function (category,state){
        self.initOpen();
        self.categoryState=state;
        if(state==2){
            self.selectedCategory=category;
        }
        // getIndexToCategory();
        if(getSortHeight()){
            self.showSortCategory=true;
        }else{
            self.initOpen();
        };
    };

    //上移二级分类
    self.upSeqCategory=function (category){
        var sepCategory=self.selectedCategory.separatCategory;
        var index=sepCategory.indexOf(category);
        if(index>0){
            var a=sepCategory[index-1];
            sepCategory[index-1]=sepCategory[index];
            sepCategory[index]=a;
        }
    };

    //下移二级分类
    self.downSeqCategory=function (category){
        var sepCategory=self.selectedCategory.separatCategory;
        var index=sepCategory.indexOf(category);
        var length=sepCategory.length;
        if(index<length-1){
            var a=sepCategory[index+1];
            sepCategory[index+1]=sepCategory[index];
            sepCategory[index]=a;
        }
    };

    //保存排序
    self.saveSort=function(){
        switch(self.categoryState){
            case 1:
                var error=[];

                var length=self.categories.length;
                var count=1;
                 var result=function(){
                    if(count>length){
                        if(error.length>0){
                            alert(error.toSoring());
                        }
                        init();
                    }
                    
                };
                _.each(self.categories,function (category){
                    
                    category.seq=self.categories.indexOf(category)+1;
                    Category.update({id:category._id},category,function (data){
                        count++;
                        if(data.code){
                            error.push(data.msg);
                        }
                        
                        result();
                    },function (err){
                        count++;
                        if(err){
                            error.push(err);
                        }
                    });
                });
                
                break;
            case 2:
                Category.update({id:self.selectedCategory._id},self.selectedCategory,function (data){
                    if(data.code){
                        return alert(data.msg);
                    }
                    init();
                },function(){

                });
                break;
            default:
                alert(self.languagePack.restaurant.manage.product.categories.errorState);
                self.initOpen();
        }
    };

    //上移一级分类 
    self.upCategory=function(category){
        var categories=self.categories;
        var index=categories.indexOf(category);
        if(index>0){
            var a=categories[index-1];
            categories[index-1].seq=
            categories[index-1]=categories[index];
            categories[index]=a;
        }

    };

    //下移一级分类
    self.downCategory=function (category){
        var categories=self.categories;
        var index=categories.indexOf(category);
        var length=categories.length;
        if(index<length-1){
            var a=categories[index+1];
            categories[index+1]=categories[index];
            categories[index]=a;
        }
    };

  }]);
