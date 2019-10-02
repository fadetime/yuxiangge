'use strict';

angular.module('kuaishangcaiwebApp')
  .controller('OrderDetailCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order', 'Printer',
    function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Printer) {
    var self = this;
    $scope.updateLanguage = function(){
        // console.log("product-view");
      init();
    };
    var orderId = $stateParams.id;
    var scopePrinter;
    var LODOP;
    var localPrinterNames;
    var defaultPrinter;

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
  		loadOrder();
  	};
    //保留整数
    var dealNumber=function(num){
      var num2=num.toFixed(3);
      return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+1));
    };

    var getLeftDivHeight = function (extras,pan_category){
      var index = 0;
      _.each(extras, function (extra){
        index++;
      });
      if(pan_category){
        self.extraHeight=36*(index+3);
      }else{
        self.extraHeight=36*(index+2);
      }
      
    };

    var getRightDivHeight = function (products){
      var index = 0;
      _.each(products, function (product){
        index++;
      });
      self.productHeight=36*(index+2);
    };

    var heightChange = function (){
      if(self.extraHeight<=self.productHeight){
        self.extraHeight = self.productHeight;
        self.extraHeight="height:" + self.extraHeight + "px;";
        // self.productHeight="height:" + self.productHeight + "px;";
      }
    };


    var loadOrder = function (){
       	Order.show({id:orderId,random:new Date().getTime()},{},function (data){
       		self.order = data.order;
          self.pan_category=data.order.pan_category;
          self.pan_soups = data.order.pan_soups;
       		self.extras = data.order.extras;
          getLeftDivHeight(self.extras,self.pan_category);
       		self.products = data.order.products;
          getRightDivHeight(self.products);
       		self.discount = dealNumber((100-self.order.discount*100))+'%';
          self.servicePercent = dealNumber(self.order.servicePercent*100)+'%';
          self.gstPercent = dealNumber(self.order.gstPercent*100)+'%';
          heightChange();
          self.pan_soupHighPrice=0;
          self.pan_soupsNames=[];
          self.pan_soupsNames_english=[];
          _.each(self.pan_soups,function (pan_soup){
            self.pan_soupsNames.push(pan_soup.name);
            self.pan_soupsNames_english.push(pan_soup.name_english);
            if(self.pan_soupHighPrice<pan_soup.finalTotal){
              self.pan_soupHighPrice=pan_soup.finalTotal;
            }
          });
       	},function (){

       	});
   	};

    var loadPrinters = function (cb){
      Printer.index({},{},function (data){
        initPrint(data.prints);
        cb();
      },function (){

      });
    };
    //20190704 edit web print font size
    var initPrintModel = function (){
      var createDate = new Date(self.order.createDate);
      var str='<div style="font-size:20px;word-break: keep-all;width:320px;padding:0 20px;">';
      str+='<div><div style="font-size:20px;font-weight:900;text-align:center;margin-bottom:10px;word-break: keep-all">'+self.order._restaurant.name+'</div><div>';
      // str+='<div><div style="font-size:20px;font-weight:900;text-align:center;margin-bottom:10px;">Upin Dining Pte Itd</div><div>';
      //餐厅地址
      str+='<div><span>地址(Address):</span><span>'+self.order._restaurant.address+'</span><div>';
      //餐厅电话
      str+='<div><span>电话(Tel):</span><span>'+self.order._restaurant.tel+'</span><div>';
      //税号
      str+='<div><span>税号(GST Reg):</span><span>201911821D</span></div>';
      //查询号
      // str+='<span>查询号(Query number):</span><span>'+self.order._id+'</span></div>';
      //桌号
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="text-align:left;"><div><div style="width:120px;float:left">桌号(Table):</div>';
      str+='<div style="width:120px;float:left;font-size:20px;font-weight:600;">'+self.order.table.name+'</div>';
      //服务员
      str+='<div style="clear:both"></div></div><div><div style="width:120px;float:left">服务员(staff):</div>';
      str+='<div style="width:120px;float:left">'+self.order.waiter.name+'</div>';
      //时间
      str+='<div style="clear:both"></div></div><div><div style="width:100px;float:left">日期(Date):</div>';
      str+='<div style="width:120px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
      str+='<div style="clear:both"></div><div style="width:100px;float:left">时间(time):</div>';
      str+='<div style="width:120px;float:left">'+createDate.Format("hh:mm")+'</div>';
      //单号
      str+='<div style="clear:both"></div></div><div><div style="width:100px;float:left">单号(NO.):</div>';
      str+='<div style="width:120px;float:left">'+self.order.doNumber+'</div>';
      str+='<div style="clear:both"></div></div></div>';
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      // 名称
      str+='<div><div><div style="width:160px;text-align:left;float:left">品名</div>';
      str+='<div style="width:65px;text-align:center;float:left">数量</div>';
      str+='<div style="width:65px;text-align:right;float:left">金额</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:160px;text-align:left;float:left">Item</div>';
      str+='<div style="width:65px;text-align:center;float:left">Qty</div>';
      str+='<div style="width:65px;text-align:right;float:left">Amt</div>';
      str+='<div style="clear:both"></div></div>';
      // 锅子
      //原始-显示锅底和括号内的汤底
      // str+='<div><div><div style="width:175px;text-align:left;float:left">'+self.order.pan_category.name+'('+self.pan_soupsNames+')'+'</div>';
      // str+='<div style="width:75px;text-align:right;float:left">'+self.pan_soupHighPrice+'</div>';
      // str+='<div style="clear:both"></div></div><div>';
      // str+='<div style="width:175px;text-align:left;float:left">'+self.order.pan_category.name_english+'('+self.pan_soupsNames_english+')'+'</div>'; 
      // str+='<div style="clear:both"></div></div></div>';
      //原始-显示锅底和括号内的汤底
      //新加-按汤底条目显示并附带数量和价格
      _.each(self.pan_soups,function (pan_soups){
        str+='<div><div>';
        str+='<div style="width:160px;text-align:left;float:left">'+pan_soups.name+'</div>';
        str+='<div style="width:75px;text-align:center;float:left">'+'x1'+'</div>';
        str+='<div style="width:75px;text-align:right;float:left">'+pan_soups.price+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+pan_soups.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //新加-按汤底条目显示并附带数量和价格
      // 额外收费
      _.each(self.extras,function (extra){
        str+='<div><div>';
        str+='<div style="width:160px;text-align:left;float:left">'+extra.name+'</div>';
        str+='<div style="width:75px;text-align:center;float:left">'+extra.orderQuantity+'</div>';
        str+='<div style="width:75px;text-align:right;float:left">'+extra.finalTotal+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:100px;text-align:left;float:left">'+extra.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //产品
      //190720 add same quantity
      var newProductArray = []
      _.each(self.products,function (value,key){
        if(newProductArray.length === 0){
          newProductArray.push(value);
        }else{
          var pushFlag = true
          _.each(newProductArray,function (product,index){
            if(product._product === value._product){
              pushFlag = false;
              product.orderQuantity = product.orderQuantity + value.orderQuantity;
              product.finalTotal = product.price * product.orderQuantity;
            }
          });
          if(pushFlag){
            newProductArray.push(value);
          }
        }
        
      });
      //add same quantity end
      _.each(newProductArray,function (product){
        str+='<div><div>';
        str+='<div style="width:160px;text-align:left;float:left">'+product.name+'</div>';
        str+='<div style="width:65px;text-align:center;float:left">x'+product.orderQuantity+'</div>';
        str+='<div style="width:65px;text-align:right;float:left">'+product.finalTotal+'</div>';
        str+='<div style="clear:both"></div></div><div>';
        str+='<div style="width:160px;text-align:left;float:left;word-break: keep-all;">'+product.name_english+'</div>';
        str+='<div style="clear:both"></div></div></div>';
      });
      //结算部分
      str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="text-align:left;"><div><div style="width:160px;float:left;word-break: keep-all">菜品合计(Sub Total):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+self.order.total+'</div>';
      str+='<div style="clear:both"></div></div><div>';
      str+='<div style="width:160px;float:left">服务费(SvcCharge)(<span>'+self.servicePercent+'</span>):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+self.order.serviceCharge+'</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:160px;float:left">折扣(Discount):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+self.discount+'</div>';
      str+='<div style="clear:both"></div></div><div>';
      str+='<div style="width:160px;float:left">税金(Gst)(<span>'+self.gstPercent+'</span>):</div>';
      str+='<div style="width:90px;float:left;text-align:right">'+self.order.gst+'</div>';
      str+='<div style="clear:both"></div></div><div><div style="width:160px;float:left">实收(Total):</div>';
      str+='<div style="width:90px;float:left;font-size:20px;;text-align:right;font-weight:bold">'+self.order.subtotal.toFixed(2)+'</div>';
      str+='<div style="clear:both"></div></div></div>';
      str+='<hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
      str+='<div style="font-size:20px;">Thanks!</div></div>';
      return str;
    };

    //获取默认打印机名字
    var getDefaultPrinterName=function(){
        var LODOP=getLodop();
        var printerName=LODOP.GET_PRINTER_NAME(-1);//获取打印机名字
        return printerName;
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

    var initSignPrinter = function (printer){
        var pr=getPrinter(printer.name);
        var printerObj={
            // printer:pr,//打印机对象
            printerName:printer.name,//打印机名
            isPrintOrder:printer.isPrintOrder,
            isPrintPanAndSoup:printer.isPrintPanAndSoup,
            isPrintProduct:printer.isPrintProduct,
            productCategory:printer.productCategory
        }

        if(pr){
          if(!scopePrinter && printer.isPrintOrder){
            scopePrinter = printerObj;
            return;
          }
          if(!defaultPrinter){
            var name=getDefaultPrinterName();
            if(name==printerObj.printerName){
                defaultPrinter=printerObj;
            }
          }
        }

    };

    var initPrint = function (printerData){
      LODOP=getLodop();
      if(!LODOP.PRINT_INIT){
          self.showError=self.languagePack.restaurant.order.printerErr;
          self.errorPrompt = true;
          return;
      }
      LODOP.PRINT_INIT("");
      _.each(printerData,function (printer2){
          // printers中没有默认打印机
          if(!scopePrinter){
            initSignPrinter(printer2); 
          }else{
            return false;
          }
      });
      if(!scopePrinter && !defaultPrinter){
          // alert(self.languagePack.restaurant.printer.defaultPrinterIniteErr);
          self.showError=self.languagePack.restaurant.order.printerErr;
          self.errorPrompt = true;
      }else{
        if(!scopePrinter){
          scopePrinter = defaultPrinter;
        }
        LODOP.SET_PRINTER_INDEXA(scopePrinter.printerName);//设置打印机
        LODOP.SET_PRINT_PAGESIZE(3,880,100,"");
      }

    };
   
    self.print = function (){
      loadPrinters(function (){
        if (scopePrinter) {
          LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",initPrintModel());
          LODOP.PRINT();
        }
      });
    };

    init();
  }]);
