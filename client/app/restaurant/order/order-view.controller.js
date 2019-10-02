'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('ViewOrderCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order','Printer',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Printer) {
    var self = this;
    $scope.updateLanguage = function(){
      init();
    };
    var page = $stateParams.page || 1;
    var itemsPerPage = $stateParams.itemsPerPage || 20;
    var date = $stateParams.date;
    var isShowVerificationBox = false
    var tempOrderInfo = null
    $scope.user = {};
    var printers=[];//不包含默认打印机
    var defaultPrinter;
    var localPrinterNames;
    var LODOP;//打印机实体对象
    var usePrinter;
    self.intervalId="";//打印定时器
    
    //保留两位小数
    var dealNumber=function(num){
      var num2=num.toFixed(3);
      return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+1));
    };

    if(isNaN(date)){
      date=new Date();
    }else{
      date=new Date(parseInt(date));
    }
    self.date=date;
    var dateTimes = date.getTime();

    self.pagination = {
  		page: page,
  		itemsPerPage: itemsPerPage,
  		maxSize: 5,
  		numPages: null,
  		totalItems: null
  	};
    self.showDate=false;
  	var doLocation = function (){
      $location
        .search('page',self.pagination.page)
        .search('itemsPerPage',self.pagination.itemsPerPage)
        .search('date',self.date.getTime());
    };

  	var init = function (){
      if(!languagePack){
          return;
      }
      self.languagePack=languagePack;
  		loadOrders();
      loadAndInitPrinters();
  	};

  	var loadOrders = function (){
   		var condition = {
          itemsPerPage:self.pagination.itemsPerPage,
          page:self.pagination.page,
          date:self.date.getTime(),
          random:new Date().getTime()
      };

     	Order.index(condition,{},function (data){
     		self.orders = data.orders;
        var count = data.count;
        self.pagination.totalItems = count;
        self.pagination.numPages = count/self.pagination.itemsPerPage;
     	},function (){

     	});
   	};

    var loadUnPrinterOrders=function (cb){
      var condition = {
          date:self.date.getTime(),
          random:new Date().getTime(),
          unPrinteOrders:true
      };

      Order.index(condition,{},function (data){
        cb(data.orders);
      },function (){

      });
    };

   	self.pageChanged = function (){
        doLocation();
        loadOrders();
    };

    self.select = function(){
      if(self.date.getTime() != dateTimes){
        doLocation();
      }
    };

    self.download=function (){
      var condition={
        startTime:self.date.getTime(),
        state:'export'
      };
      Order.statistic(condition,{},function (){
        var url=$location.$$absUrl;
        var index=url.indexOf('/restaurant');
        url=url.slice(0,index);
        url+='/api/orders/statistics/onedaydate';
        var iframe = document.getElementById("myIframe");
        if(iframe){
            iframe.src = url;
        }else{
            iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            iframe.id = "myIframe";
            document.body.appendChild(iframe);
        }
      },function(){

      });
    };
    //20190704 edit font size
    var initPrintModel = function (order){
      var createDate = new Date(order.createDate);
      var str='<div style="font-size:20px;word-wrap:break-word;word-break:break-all;width:280px;padding:0 20px;">';
      str+='<div><div style="font-size:20px;font-weight:900;text-align:center;margin-bottom:10px;">'+order._restaurant.name+'</div><div>';
      // str+='<div><div style="font-size:20px;font-weight:900;text-align:center;margin-bottom:10px;">Upin Dining Pte Itd</div><div>';
      //餐厅地址
      str+='<span>地址(Address):</span><span>'+order._restaurant.address+'</span></div><div>';
      //餐厅电话
      str+='<span>电话(Tel):</span><span>'+order._restaurant.tel+'</span></div><div>';
      //税号
      str+='<span>税号(GST Reg):</span><span>201911821D</span></div>';
      //查询号
      // str+='<span>查询号(Query number):</span><span>'+order._id+'</span></div>';
      //桌号
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="text-align:left;"><div><div style="width:120px;float:left">桌号(Table):</div>';
      str+='<div style="width:120px;float:left;font-size:20px;font-weight:600;">'+order.table.name+'</div>';
      //服务员
      str+='<div style="clear:both"></div></div><div><div style="width:120px;float:left">服务员(staff):</div>';
      str+='<div style="width:120px;float:left">'+order.waiter.name+'</div>';
      //时间
      str+='<div style="clear:both"></div></div><div><div style="width:100px;float:left">日期(Date):</div>';
      str+='<div style="width:120px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
      str+='<div style="clear:both"></div><div style="width:100px;float:left">时间(time):</div>';
      str+='<div style="width:120px;float:left">'+createDate.Format("hh:mm")+'</div>';
      //单号
      str+='<div style="clear:both"></div></div><div><div style="width:100px;float:left">单号(NO.):</div>';
      str+='<div style="width:120px;float:left">'+order.doNumber+'</div>';
      str+='<div style="clear:both"></div></div></div>';
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      // 名称
      str+='<div><div><div style="width:100px;text-align:left;float:left">品名</div>';
      str+='<div style="width:75px;text-align:center;float:left">数量</div>';
      str+='<div style="width:75px;text-align:right;float:left">金额</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:100px;text-align:left;float:left">Item</div>';
      str+='<div style="width:75px;text-align:center;float:left">Qty</div>';
      str+='<div style="width:75px;text-align:right;float:left">Amount</div>';
      str+='<div style="clear:both"></div></div>';
      // 锅子
      // str+='<div><div><div style="width:175px;text-align:left;float:left">'+order.pan_category.name+'('+order.pan_soupsNames+')'+'</div>';
      // str+='<div style="width:75px;text-align:right;float:left">'+order.pan_soupHighPrice+'</div>';
      // str+='<div style="clear:both"></div></div><div>';
      // str+='<div style="width:175px;text-align:left;float:left">'+order.pan_category.name_english+'('+order.pan_soupsNames_english+')'+'</div>';
      // str+='<div style="clear:both"></div></div></div>';
      //新加-按汤底条目显示并附带数量和价格
      _.each(order.pan_soups,function (pan_soups){
        str+='<div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+pan_soups.name+'</div>';
        str+='<div style="width:75px;text-align:center;float:left">'+'x1'+'</div>';
        str+='<div style="width:75px;text-align:right;float:left">'+pan_soups.price+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+pan_soups.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //新加-按汤底条目显示并附带数量和价格
      // 额外收费
      _.each(order.extras,function (extra){
        str+='<div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+extra.name+'</div>';
        str+='<div style="width:75px;text-align:center;float:left">'+extra.orderQuantity+'</div>';
        str+='<div style="width:75px;text-align:right;float:left">'+extra.finalTotal+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+extra.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //产品
      _.each(order.products,function (product){
        str+='<div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+product.name+'</div>';
        str+='<div style="width:75px;text-align:center;float:left">'+product.orderQuantity+'</div>';
        str+='<div style="width:75px;text-align:right;float:left">'+product.finalTotal+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+product.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //结算部分
      str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="text-align:left;"><div><div style="width:160px;float:left">菜品合计(Sub Total):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+order.total+'</div>';
      str+='<div style="clear:both"></div></div><div>';
      str+='<div style="width:160px;float:left">服务费(SvcCharge)(<span>'+order.servicePercent+'</span>):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+order.serviceCharge+'</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:160px;float:left">折扣(Discount):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+order.discount+'</div>';
      str+='<div style="clear:both"></div></div><div>';
      str+='<div style="width:160px;float:left">税金(Gst)(<span>'+order.gstPercent+'</span>):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+order.gst+'</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:160px;float:left">实收(Total):</div>';
      str+='<div style="width:90px;float:left;font-size:20px;;text-align:right;font-weight:bold">'+order.subtotal+'</div>';
      str+='<div style="clear:both"></div></div></div>';
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="font-size:16px;">Thanks!</div></div>';
      return str;
    };

    //获取本地打印机的名字
    var getLocalPrinterNames=function(){
        var names=[];
        var count=LODOP.GET_PRINTER_COUNT();
        for(var i=0;i<count;i++){
            names.push(LODOP.GET_PRINTER_NAME(i));
        }
        // console.log(names.toString());
        return names;
    };

    //本地存在打印机对象，返回打印机对象，否则返回空
    var getPrinter=function (printerName){
        if(!localPrinterNames){
            localPrinterNames=getLocalPrinterNames();
        }
        if(localPrinterNames.indexOf(printerName)>-1){
            return true;
        }else{
            return false;
        }
    };

    //获取默认打印机名字
    var getDefaultPrinterName=function(){
        var LODOP=getLodop();
        var printerName=LODOP.GET_PRINTER_NAME(-1);//获取打印机名字
        return printerName;
    };

    var initSignPrinter = function (printer){
      var pr=getPrinter(printer.name);
      var printerObj={
          // printer:pr,//打印机对象
          printerName:printer.name,//打印机名
          isPrintOrder:printer.isPrintOrder
      }
      if(pr){
          //默认为第一满足条件的
          if(!defaultPrinter){
              var name=getDefaultPrinterName();
              if(name==printerObj.printerName){
                  defaultPrinter=printerObj;
              }else{
                 printers.push(printerObj); 
              }
          }else{
              printers.push(printerObj);
          }
          
      }
    };

    var isAbleToPrint=function (printer){
        if(!printer.isPrintOrder){
            return false;
        }
        return true;
    };

    var initPrinter=function (printerData){
        LODOP=getLodop();
        if(!LODOP.PRINT_INIT){
            self.showError=self.languagePack.restaurant.printer.unSupportLODOP;
            self.errorPrompt = true;
            return;
        }
        
        LODOP.PRINT_INIT("");
        // LODOP.SET_PRINT_PAGESIZE(3,8120,100,"");
        _.each(printerData,function (printer){
            // printers中没有默认打印机
            initSignPrinter(printer); 
        });
        if(isAbleToPrint(defaultPrinter)){
            usePrinter=defaultPrinter;
        }else{
            var sign=true;
            _.each(printers,function (printer){
                if(isAbleToPrint(printer)){
                    sign=false;
                    usePrinter=printer;
                    return false;
                }
            });
            //如果均不能打印则默认打印机打印
            if(sign){
                usePrinter=defaultPrinter;
            }
        }
        if(!defaultPrinter){
            // alert(self.languagePack.restaurant.printer.defaultPrinterIniteErr);
            self.showError=self.languagePack.restaurant.printer.defaultPrinterIniteErr;
            self.errorPrompt = true;
        }
        // console.log(printers,defaultPrinter,panSoupPrinter);
    };

    //载入打印机
    var loadAndInitPrinters=function(){
        Printer.index({},{},function (data){
            initPrinter(data.prints);
        },function(){

        });
    };

    var setPrint=function (){
      LODOP.SET_PRINT_PAGESIZE(3,880,100,"");
      LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);//设置对后台打印状态补获
      LODOP.SET_PRINTER_INDEXA(usePrinter.printerName);//设置打印机
    };

    var stopPrint=function(){
        if(self.intervalId!=""){
            clearInterval(self.intervalId);
            self.intervalId="";
        }
    };

    var openKey=function (index,length){
      if(index==length){
        openPrint=true;
      }
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

    var automaticPrint=function(){
      initIntervalIdsEmpty();
      self.intervalId=setInterval(function (){
        if(openPrint){
          openPrint=false;
        }else{
          return;
        }
        loadUnPrinterOrders(function (orders){
          var length=orders.length;
          var index=0;
          if(length>0){
            _.each(orders,function (order){
              Order.changePrintState({b:order._id},{},function (){
                index++;
                openKey(index,length);
              },function (){
                index++;
                openKey(index,length);
              });
              order.pan_soupsNames=[];
              order.pan_soupsNames_english=[];
              order.pan_soupHighPrice=0;
              order.discount = dealNumber((100-order.discount*100))+'%';
              order.servicePercent = dealNumber(order.servicePercent*100)+'%';
              order.gstPercent = dealNumber(order.gstPercent*100)+'%';
              _.each(order.pan_soups,function (pan_soup){
                order.pan_soupsNames.push(pan_soup.name);
                order.pan_soupsNames_english.push(pan_soup.name_english);
                if(order.pan_soupHighPrice<pan_soup.finalTotal){
                  order.pan_soupHighPrice=pan_soup.finalTotal;
                }
              });
              if(order.status>1){
                setPrint();
                LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",initPrintModel(order));
                // if(order.status==4){
                //   LODOP.SET_PRINT_COPIES(2);
                // }
                console.log(order._id);
                LODOP.PRINT();
              }
              
            });
            // loadOrders();
            console.log('1');
          }else{
            openPrint=true;
          }
          // console.log(orders);
        }); 
      },1000*5);
      orderIntervalIds.push(self.intervalId);

    };

    self.autoPrint=function(){
        if(self.intervalId!=""){
            console.log("关闭自动打印");
            stopPrint();
        }else{
            console.log("开启自动打印");
            automaticPrint();
        }
    };
    self.testMethod=function(searchOrderNum){
      console.log(searchOrderNum)
      Order.searchOrderNum({id:searchOrderNum},{},function(data){
            console.log(data)
            var tempOrders = []
            tempOrders.push(data)
            self.orders = tempOrders;
            self.pagination.totalItems = 1;
            self.pagination.numPages = 1;
      },function(){

      });
    }
    self.checkRoleMethod=function(order){
      self.isShowVerificationBox = true
      self.tempOrderInfo = order
    }
    self.checkUserMethod=function(){
      Auth.check({
        account: $scope.user.account,
        password: $scope.user.password
      })
      .then( function(data) {
        $state.go("restaurant-orders-edit",{id:self.tempOrderInfo._id});
      })
      .catch( function(err) {
        console.log('enter catch')
        console.log(err)
      });
    }
    init();
  }]);
