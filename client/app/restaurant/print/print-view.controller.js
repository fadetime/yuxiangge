'use strict';

angular.module('kuaishangcaiwebApp')
.controller('PrintViewCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order','Printer',
function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Printer) {
    var self=this;
    $scope.updateLanguage = function(){
      init();
    };
    // var overtime=printOvertime*1000;//打印超时时间,毫秒
    self.intervalId="";//打印定时器
    var checkJobIntervalId="";//检查定时器
    // {
    //     _orderChange//id
    //     printer//打印机对象
    //     printerName//打印机名
    //     jobId//打印机任务id
    //     status//r任务状态
    //     createDate//任务创建时间,
    //     errorDate//出错时间
    //     content//打印的内容
    //     tableName//桌号
    //     typr//打印类型 panSoup,product
    // }
    var jobs=[];
    self.errJobs=[];//打印失败的任务
    // {
    //     printer//打印机对象
    //     printerName//打印机名
    //     isPrintOrder
    //     isPrintPanAndSoup
    //     isPrintProduct
    //     productCategory
    // }
    var printers=[];//不包含默认打印机
    self.printersInitErr=[];//初始化失败的打印机名字
    var defaultPrinter;
    var panSoupPrinter;
    var reducePrinter;
    var localPrinterNames;
    var LODOP;//打印机实体对象



    var initPrintParams=function(){
        // {
        //     _orderChageng//单号
        //     printer//打印机对象
        //     printerName//打印机名
        //     tableName//桌号
        //     order_change//对象
        //     products//打印的产品
        // }
        self.printProduct="";//显示打印用产品数据
        self.printProductArr=[];//订单中分解数来待打印数组,元素结构为self.printProduct
        self.panSoupData="";//显示打印用锅和汤底数据
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

    //打印之前执行设置打印机
    var setPrinter=function(printerName){
        LODOP.SET_PRINT_PAGESIZE(3,880,100,"");
        LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);//设置对后台打印状态补获
        LODOP.SET_PRINTER_INDEXA(printerName);//设置打印机
    };

    var initSignPrinter = function (printer){
        var pr=getPrinter(printer.name);
        var printerObj={
            // printer:pr,//打印机对象
            printerName:printer.name,//打印机名
            isPrintOrder:printer.isPrintOrder,
            isPrintPanAndSoup:printer.isPrintPanAndSoup,
            isPrintProduct:printer.isPrintProduct,
            isPrintReduce:printer.isPrintReduce,
            productCategory:printer.productCategory
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
            //默认为第一满足条件的
            if(!panSoupPrinter&&printerObj.isPrintPanAndSoup){
                panSoupPrinter=printerObj;
            }
            if(!reducePrinter&&printerObj.isPrintReduce){
                reducePrinter=printerObj;
            }
        }else{
            self.printersInitErr.push(printerObj);
        }
    };

    var initPrinter=function (printerData){
        LODOP=getLodop();
        if(!LODOP.PRINT_INIT){
            self.showError=self.languagePack.restaurant.printer.unSupportLODOP;
            self.errorPrompt = true;
            return;
        }
        
        LODOP.PRINT_INIT("");
        // LODOP.SET_PRINT_PAGESIZE(3,880,100,"");
        _.each(printerData,function (printer){
            // printers中没有默认打印机
            initSignPrinter(printer); 
        });
        if(!defaultPrinter){
            // alert(self.languagePack.restaurant.printer.defaultPrinterIniteErr);
            self.showError=self.languagePack.restaurant.printer.defaultPrinterIniteErr;
            self.errorPrompt = true;
        }
        // console.log(printers,defaultPrinter,panSoupPrinter);
    };

    //获取默认打印机名字
    var getDefaultPrinterName=function(){
        var LODOP=getLodop();
        var printerName=LODOP.GET_PRINTER_NAME(-1);//获取打印机名字
        return printerName;
    };

    var getChange=function(cb){
        Order.getChange({isDeal:false},{},function (data){
            self.order_changes=data.order_changes;
            // self.testChange=data.order_changes[0];
            if(cb){
                cb();
            }
        });
    };

    var initCheckInterval=function(){
        //该定时器自检关闭
        if(checkJobIntervalId==""){
            console.log("initCheck");
            checkJobIntervalId=setInterval(function(){
                var length=jobs.length;
                var now=new Date();
                if(length==0&&self.intervalId==""){
                    console.log("closeCheck");
                    clearInterval(checkJobIntervalId);
                    checkJobIntervalId="";
                }
                for(var i=0;i<jobs.length;i++){
                    switch(job_status(jobs[i])){
                        case 0://失败
                        // console.log(0);
                            var errJob=jobs.splice(i,1);
                            errJob[0].errorDate=new Date();
                            self.errJobs.push(errJob[0]);
                            $scope.$apply();
                            break;
                        case 1://成功
                        // console.log(1);
                            jobs.splice(i,1);
                            break;
                        case 2:
                        // console.log(2);
                            // //设置超时
                            // if(overtime<(now-job[i].createDate)){
                            //     var errJob=jobs.splice(i,1);
                            //     self.errJobs.push(errJob[0]);
                            // }
                            break;
                    }
                }
            },5000);//60*1000
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
    initIntervalIdsEmpty();

    var automaticPrint=function(){
        // 如果没有初始化出默认打印机，报错
        if(defaultPrinter){
            //主流程定时器，打印执行
            var beginAutoPrint=function(){
                getChange(function(){
                    // while(self.order_changes.length>0){
                    //     dealChange(self.order_changes[0]);
                    // }
                    _.each(self.order_changes,function (order_change){
                        dealChange(order_change);
                    });  
                });
            };
            beginAutoPrint();
            self.intervalId=setInterval(function(){
                beginAutoPrint();
            },1000*5);//30*1000
            productIntervalIds.push(self.intervalId);
            //检查流程定时器，结果判断jobs
            initCheckInterval();
        }else{
            self.showError=self.languagePack.restaurant.printer.defaultPrinterIniteErr;
            self.errorPrompt = true;
            // loadAndInitPrinters();
        }      
    };

    var stopPrint=function(){
        if(self.intervalId!=""){
            clearInterval(self.intervalId);
            self.intervalId="";
        }
    };

    //载入打印机
    var loadAndInitPrinters=function(){
        Printer.index({},{},function (data){
            initPrinter(data.prints);
        },function(){

        });
    };

    //检查X打印机是否能打印该产品
    var isAbleToPrint=function (printer,product){
        if(!printer.isPrintProduct){
            return false;
        }
        var sign=true;
        _.each(product._category,function (category){
            if(printer.productCategory.indexOf(category)>-1){
                sign=false;
                return false;
            }
        });
        if(sign){
            return false;
        }
        return true;
    };

    //初始化菜品数组
    var initPrintProductArr=function (order_change){
        var pushToArrByPrinter=function (printer,product){
            var c=_.findWhere(self.printProductArr,{printerName:printer.printerName});
            if(c){
                c.products.push(product);
            }else{
                var obj={
                    _orderChageng:order_change._id,
                    // printer:printer.printer,//打印机对象
                    printerName:printer.printerName,//打印机名
                    order_change:order_change,//对象
                    tableName:order_change.table.name,
                    products:[product]//打印的产品
                };
                self.printProductArr.push(obj);
            }
        };
        _.each(order_change.products,function (product){
            if(isAbleToPrint(defaultPrinter,product)){
                pushToArrByPrinter(defaultPrinter,product);
            }else{
                var printerObj;
                var sign=true;
                _.each(printers,function (printer){
                    if(isAbleToPrint(printer,product)){
                        sign=false;
                        printerObj=printer;
                        return false;
                    }
                });
                //如果均不能打印则默认打印机打印
                if(sign){
                    printerObj=defaultPrinter;
                }
                pushToArrByPrinter(printerObj,product);
            }
        });
    };

    //job传入任务数组的一个元素
    //是否打印完成
    var getPRINT_STATUS_OK=function(job){

        var code=LODOP.GET_VALUE('PRINT_STATUS_OK',job.jobId);
        if(code==1){
            return true;
        }else{
            return false;
        }
    };

    //是否在任务队列
    var getPRINT_STATUS_EXIST=function(job){
        var code=LODOP.GET_VALUE('PRINT_STATUS_EXIST',job.jobId);
        if(code==1){
            return true;
        }else{
            return false;
        }
    };

    //判断任务成功或失败,正在执行不返回
    var job_status=function (job){
        // console.log(job);
        LODOP.SET_PRINTER_INDEXA(job.printerName);//设置打印机
        LODOP.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);
        // console.log(getPRINT_STATUS_OK(job),getPRINT_STATUS_EXIST(job),LODOP.GET_VALUE('PRINT_STATUS_TEXT',job.jobId),job);
        if(getPRINT_STATUS_OK(job)||(!getPRINT_STATUS_EXIST(job)&&LODOP.GET_VALUE('PRINT_STATUS_TEXT',job.jobId)!='错误 - 正在打印')){
            return 1;//打印完毕
        }
        if(LODOP.GET_VALUE('PRINT_STATUS_TEXT',job.jobId)=='错误 - 正在打印'){
            return 0;//打印任务失败
        }
        return 2;//尚未打印，还在打印列表中
    };

    //修改orderChange状态
    var dealOrderChangeById=function (id){
        // var c=_.findWhere(self.order_changes,{_id:id});
        // self.order_changes.splice(self.order_changes.indexOf(c),1);
        Order.dealChange({b:id},{},function(){
            
        },function(){

        });
    };

    //打印模板
    var innerHTML=function(state){
        switch(state){
            case "product":
                return initProductModel();
            case "panSoup":
                return initPanSoupModel();
            case "reduce":
                return initReduceModel();
        }
        
        // var htmlStr='';
    };

    //生成product打印模板
    var initProductModel=function(){
        var status=self.printProduct.order_change.state;
        var createDate=new Date(self.printProduct.order_change.createDate);
        var str='<div style="font-size:30px;word-wrap:break-word;word-break:break-all;padding:0 20px;">';
        str+='<div style="text-align:left;">';
        //table
        str+='<div><div style="">桌号:</div>';
        str+='<div><div style=";font-weight:600;">'+self.printProduct.order_change.table.name+'</div>';
        //订单状态
        str+='<div><div style="">订单状态:</div>';
        str+='<div><div style="">'+(status==2?'下单':'加单')+'</div>';
        //日期
        str+='<div><div style="font-size:30px;">日期:</div>';
        str+='<div><div style="font-size:30px;">'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div><div style="font-size:30px;">时间:</div>';
        str+='<div><div style="font-size:30px;">'+createDate.Format("hh:mm")+'</div>';
        //单号，order_change
        // str+='<div><div style="width:100%;float:left">单号:</div>';
        // str+='<div style="clear:both"></div></div>';
        // str+='<div style="width:200px;float:left">'+self.printProduct.order_change.doNumber+'</div>';
        // str+='<div style="clear:both"></div></div>';
        //订单号：order
        str+='<div><div style="font-size:30px;">订单号:</div>';
        str+='<div style="font-size:30px;">'+self.printProduct.order_change.doNumber+'</div>';
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        //内容部分
        str+='<div>';
        //标题
        str+='<div><div style="font-size:30px;width:140px;text-align:left;float:left">品名</div>';
        str+='<div style="font-size:30px;width:70px;text-align:center;float:left">数量</div>';
        str+='<div style="clear:both"></div></div>';
        //product
        _.each(self.printProduct.products,function (product){
            str+='<div><div style="font-size:30px;width:140px;text-align:left;float:left">'+product.name+'</div>';
            str+='<div style="font-size:30px;width:70px;text-align:center;float:left">'+product.orderQuantity+'</div>';
            str+='<div style="clear:both"></div></div>';
        });
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        return str;
    };

    //生成product退菜打印模板
    var initReduceModel=function(){
        var status=self.reduceData.state;
        var createDate=new Date(self.reduceData.createDate);
        var str='<div style="font-size:30px;word-wrap:break-word;word-break:break-all;width:260px;padding:0 20px;">';
        str+='<div style="text-align:left;">';
        //table
        str+='<div>桌号:</div>';
        str+='<div style="font-weight:600;">'+self.reduceData.table.name+'</div>';
        //订单状态
        str+='<div>订单状态:</div>';
        str+='<div>'+(status==4?'减菜':'催菜')+'</div>';
        //日期
        str+='<div>日期:</div>';
        str+='<div>'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div>时间:</div>';
        str+='<div>'+createDate.Format("hh:mm")+'</div>';
        //单号，order_change
        // str+='<div><div style="width:60px;float:left">单号:</div>';
        // str+='<div style="width:200px;float:left">'+self.reduceData.doNumber+'</div>';
        // str+='<div style="clear:both"></div></div>';
        //订单号：order
        str+='<div>订单号:</div>';
        str+='<div>'+self.reduceData.doNumber+'</div>';
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        //内容部分
        str+='<div>';
        //标题
        str+='<div><div style="font-size:30px;width:140px;text-align:left;float:left">品名</div>';
        str+='<div style="font-size:30px;width:40px;text-align:center;float:left">数量</div>';
        str+='<div style="clear:both"></div></div>';
        //product
        _.each(self.reduceData.products,function (product){
            str+='<div><div style="font-size:30px;width:140px;text-align:left;float:left">'+product.name+'</div>';
            str+='<div style="font-size:30px;width:40px;text-align:center;float:left">'+product.orderQuantity+'</div>';
            str+='<div style="clear:both"></div></div>';
        });
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        return str;
    };

    //生成panSoup打印模板
    //190601 Change font-size to 24px
    //190719 Change font-size to 38px
    //190722 Change font-size to 30px
    var initPanSoupModel=function(){
        var createDate=new Date(self.panSoupData.createDate);
        var str='<div style="font-size:30px;word-wrap:break-word;word-break:break-all;width:260px;padding:0 20px;">';
        str+='<div style="text-align:left;">';
        //table
        str+='<div>桌号:</div>';
        str+='<div style="width:140px;font-weight:600;">'+self.panSoupData.table.name+'</div>';
        //日期
        str+='<div">日期:</div>';
        str+='<div>'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div>时间:</div>';
        str+='<div>'+createDate.Format("hh:mm")+'</div>';
        //单号，order_change
        str+='<div>单号:</div>';
        str+='<div>'+self.panSoupData.doNumber+'</div>';
        //订单号：order
        str+='<div>订单号:</div>';
        str+='<div>'+self.panSoupData.doNumber+'</div>';
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        //内容部分
        str+='<div>';
        //标题
        str+='<div style="font-size:30px;text-align:left;">品名</div>';
        // str+='<div style="font-size:30px;width:130px;text-align:center;float:left;">口味</div>';
        // str+='<div style="clear:both"></div></div>';
        //锅
        str+='<div><div style="font-size:30px;width:90px;text-align:left;float:left;">'+self.panSoupData.pan_category.name+'</div>';
        str+='<div style="clear:both"></div></div>';
        //汤底
        _.each(self.panSoupData.pan_soups,function (soup){
            str+='<div><div style="font-size:30px;text-align:left;">'+soup.name+'</div>';
            str+='<div style="text-align:left;">';
            _.each(soup.attribute,function (att){
                str+='<div style="font-size: 30px">'+att.name+':'+att.value.name+'</div>';
            });
            str+='</div>';
            str+='<div style="clear:both"></div></div>';
        });

        return str;
    };

    //开始打印锅底汤底
    var beginToPrintPanSoup=function(){
        console.log("print-pan");
        var choosePrinter;
        if(panSoupPrinter){
            choosePrinter=panSoupPrinter;
        }else{
            choosePrinter=defaultPrinter;
        }
        console.log(choosePrinter,'xutao');
        // choosePrinter.printer.SET_PRINT_MODE("CATCH_PRINT_STATUS",true);//设置对后台打印状态补获
        setPrinter(choosePrinter.printerName);
        // document.getElementById("pan").innerHTML=innerHTML('panSoup');//页面显示测试
        var content=innerHTML('panSoup');
        LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",content);
        var jobId=LODOP.PRINT();
        // console.log(jobId);
        var job={
            _orderChange:self.panSoupData._id,//id
            // printer:choosePrinter.printer,//打印机对象
            printerName:choosePrinter.printerName,//打印机名
            jobId:jobId,//打印机任务id
            status:2,//任务状态
            content:content,//打印内容
            tableName:self.panSoupData.table.name,
            type:'panSoup',
            createDate:new Date()
        };
        jobs.push(job);
        initCheckInterval();
        dealOrderChangeById(self.panSoupData._id);
    };

    //开始进行菜品打印
    var beginToPrintProduct=function(){
        console.log("print-product");
        _.each(self.printProductArr,function (printProduct){
            self.printProduct=printProduct;
            setPrinter(printProduct.printerName);
            // document.getElementById("product").innerHTML=innerHTML('product');//页面显示测试
            var content=innerHTML('product');
            LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",content);
            var jobId=LODOP.PRINT();
            // console.log(jobId);
            var job={
                _orderChange:self.printProduct._orderChageng,//id
                // printer:self.printProduct.printer,//打印机对象
                printerName:self.printProduct.printerName,//打印机名
                jobId:jobId,//打印机任务id
                status:2,//任务状态
                content:content,//打印内容
                tableName:self.printProduct.tableName,
                type:'product',
                createDate:new Date()
            };
            jobs.push(job);
        });
        initCheckInterval();
        dealOrderChangeById(self.printProduct._orderChageng);
        self.printProductArr=[];
    };

    //开始进行退菜打印
    var beginToPrintReduce=function(){
        console.log("print-reduce");
        var choosePrinter;
        if(reducePrinter){
            choosePrinter=reducePrinter;
        }else{
            choosePrinter=defaultPrinter;
        }
        setPrinter(choosePrinter.printerName);
        // document.getElementById("product").innerHTML=innerHTML('product');//页面显示测试
        var content=innerHTML('reduce');
        LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",content);
        var jobId=LODOP.PRINT();
        // console.log(jobId);
        var job={
            _orderChange:self.reduceData._id,//id
            // printer:self.printProduct.printer,//打印机对象
            printerName:choosePrinter.printerName,//打印机名
            jobId:jobId,//打印机任务id
            status:2,//任务状态
            content:content,//打印内容
            tableName:self.reduceData.table.name,
            type:'reduce',
            createDate:new Date()
        };
        jobs.push(job);
        initCheckInterval();
        dealOrderChangeById(self.reduceData._id);
        self.printProductArr=[];
    };

    var dealChange=function(order_change){
        switch(order_change.state){
            case 1://锅底汤底
                self.panSoupData=order_change;
                beginToPrintPanSoup();
                break;
            case 4://退菜
                self.reduceData=order_change;
                beginToPrintReduce();
                break;
            case 11://催菜
                self.reduceData=order_change;
                beginToPrintReduce();
                break;
            default://2.下单,3.加单
                initPrintProductArr(order_change);
                if(self.printProductArr.length==0){
                    dealOrderChangeById(order_change._id);
                }else{
                    beginToPrintProduct();
                }
                break;
        }
    };

    var initIntervalIdsEmpty=function (){
      _.each(productIntervalIds,function (id){
        clearInterval(id);
      });
      productIntervalIds=[];
    };

    var init=function(){
        if(!languagePack){
            return;
        }
        initIntervalIdsEmpty();
        self.languagePack=languagePack;
        if(!self.order_changes){
            initPrintParams();
            // loadAndInitPrinters();
            loadAndInitPrinters();
            getChange();
        }
        
        // Order.index({},{},function (data){
        //     self.printOrder=data.orders[1];
        //     var dealNumber=function(num){
        //       var num2=num.toFixed(3);
        //       return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+3));
        //     };
        //     self.printOrder.gstPercent=dealNumber(self.printOrder.gstPercent*100);
        //     self.printOrder.servicePercent=dealNumber(self.printOrder.servicePercent*100);
        //     self.printOrder.discount=dealNumber(self.printOrder.discount*100);
        // },function(){

        // });
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

    //人工操作打印
    self.print=function (order_change){
        if(defaultPrinter){
            if(self.intervalId == ""){
                dealChange(order_change);
            }
        }else{
            self.showError=self.languagePack.restaurant.printer.defaultPrinterIniteErr;
            self.errorPrompt = true;
        } 
    };

    //重新打印某项任务
    self.rePrint=function (job){
        self.errJobs.splice(self.errJobs.indexOf(job),1);
        setPrinter(job.printerName);
        // document.getElementById("product").innerHTML=innerHTML('product');//页面显示测试
        LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",job.content);
        var jobId=LODOP.PRINT();
        job.jobId=jobId;
        jobs.push(job);
    };

    self.reInitPrinter = function (printer){
        self.printersInitErr.splice(self.printersInitErr.indexOf(printer),1);
        initSignPrinter(printer); 
    };

    init();
    
}]);
