'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewProductCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Product','Category', function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Product,Category) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };

    var hasNav = $stateParams.hasNav; 
    var token = $stateParams.token; 
    var categoryId = $stateParams.category; 
    var separatCategoryId = $stateParams.separatCategory; 
    var sortBy = $stateParams.sortBy; 
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 30;  
    self.search = $stateParams.search; 
    //图片文件夹地址
    self.imageFile=imageFile;
    self.pagination = {
      page: page,
      itemsPerPage: itemsPerPage,
      maxSize: 5,
      numPages: null,
      totalItems: null
    };

    var doLocation=function(){
        $location
        .search('page', self.pagination.page)
        .search('itemsPerPage', self.pagination.itemsPerPage)
        .search('category', categoryId)
        .search('separatCategory', separatCategoryId)
        .search('sortBy', sortBy)
        .search('search', self.search)
        .search('hasNav', hasNav)
        .search('token', token);
    };


    var initEnvironment = function(hasNav,token){
        var system ={}; 
        var p = navigator.platform;      
        system.win = p.indexOf("Win") == 0; 
        system.mac = p.indexOf("Mac") == 0; 
        system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);    
        var browser_width = $(document.body).width()*0.782*0.8;

        if(browser_width>786){
            browser_width=786;
        }
        if(browser_width<786){
            browser_width=532;
        }
        $("div.box").css("width",browser_width);
        $(window).resize(function() {
            browser_width = $("div.productList").width();
            if(browser_width>786){
                browser_width=786;
            }
            if(browser_width<786){
                browser_width=532;
            }
            $("div.box").css("width",browser_width);
        }); 

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

    var getProducts = function(){
        var query={
            page:self.pagination.page,
            itemsPerPage:self.pagination.itemsPerPage,
            category:categoryId,
            separatCategory:separatCategoryId,
            isAll:true,
            retrieval:self.search,
            random:new Date().getTime()
        };
        if(sortBy=="price_down"||sortBy=="price_up"){
            query.sortBy=sortBy;
        }
        Product.index(query,{},function (data){
            self.products=data.products;
            var totalItems = data.count;
            self.pagination.totalItems = totalItems;
            self.pagination.numPages = totalItems / itemsPerPage;
            self.pagination.page = data.page;
        },function(){

        });
    };

    //载入分类
    var loadCategory = function(){
        Category.index({sortBy:"seq",random:new Date().getTime()},function (data){
            self.categories=data.categories;
            initCategoryState();
            var select=false;
            if(categoryId){
                _.each(self.categories,function (category){
                    if(categoryId==category._id){
                        category.style="unique_color";
                        select=true;
                        return false;
                    }
                }); 
            }  
            
            if(separatCategoryId){
                var open=false;
                _.each(self.categories,function (category){
                    _.each(category.separatCategory,function (sepCategory){
                        if(separatCategoryId==sepCategory._id){
                            open=true;
                            sepCategory.style="unique_color";
                            select=true
                            return false;
                        }
                    });
                    if(open){
                        category.showSep=true;
                        category.style="unique_color";
                        return false;
                    }
                });
            }

            if(!select){
                self.allProduct="red";
            }
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

    //初始化信息
    var init=function(){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
        self.languagePack=languagePack;
        oldLocation=_.clone($location);
        loadCategory();
        getProducts();
        showSort();
    };

    //init category 选中状态
    var initCategoryState=function(){
        self.allProduct="blackAlpha85";
        _.each(self.categories,function (category){
            category.style="blackAlpha85";
            category.showSep=false;
            _.each(category.separatCategory,function (sepCategory){
                sepCategory.style="blackAlpha54";
            });
        });
    };

    //init sort图标
    var initSort=function(){
        self.sortByDate="btnUnActive_down";
        self.sortByPriceDown="btnUnActive_down";
        self.sortByPriceUp="btnUnActive_up";
    };

    //将选中的排序方式表现出来
    var showSort=function(){
        initSort();
        if(sortBy=="price_down"){
            self.sortByPriceDown="btnActive_down";
        }else if(sortBy=="price_up"){
            self.sortByPriceUp="btnActive_up";
        }else{
            self.sortByDate="btnActive_down";
        }
    };

    initEnvironment(hasNav,token);

    //修改产品状态
    self.changeActive=function(product){
        Product.changestate({controller:product._id},{isActive:!product.isActive},function (data){
            if(data.code){
                return alert(data.msg);
            }
            init();
        },function (err){
            alert(err);
        });
    };

    //产品换页
    self.pageChanged=function(){
        doLocation();
    };

    //选择产品分类
    self.selectCategory=function(id,state){
        categoryId = "";
        separatCategoryId = "";
        if(id!='all'){
            switch(state){
                case 1:
                    categoryId=id;
                    break;
                case 2:
                    separatCategoryId=id;
                    break;
            };
        }
        self.pagination.page=1;
        doLocation();
    };

    //修改排序方式
    self.changeSort=function(sort){
        if(!sort){
            if(sortBy=="price_down"){
                sortBy="price_up";
            }else{
                sortBy="price_down";
            }
        }else{
            sortBy=sort;
        }
        self.pagination.page=1;
        doLocation();
    };

    //根据名字查询
    self.select=function(){
        self.pagination.page=1;
        doLocation();
    };

  }]);
