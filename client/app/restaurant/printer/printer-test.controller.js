'use strict';

angular.module('kuaishangcaiwebApp')
.controller('PrinterCtrl', ['$scope', '$location', '$state','$stateParams','$cookieStore','Auth','User','Order','Printer',
function ($scope, $location, $state,$stateParams,$cookieStore,Auth,User,Order,Printer) {
	var self=this;
    $scope.updateLanguage = function(){
      initLanguage();
    };
    // var overtime=printOvertime*1000;//打印超时时间,毫秒
    var intervalId="";//打印定时器
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
    // }
    var jobs=[];
    var errJobs=[];//打印失败的任务
    // {
    //     printer//打印机对象
    //     printerName//打印机名
    //     isPrintOrder
    //     isPrintPanAndSoup
    //     isPrintProduct
    //     productCategory
    // }
    var printers=[];//不包含默认打印机
    var printersInitErr=[];//初始化失败的打印机名字
    var defaultPrinter;
    var panSoupPrinter;
    var localPrinterNames;
    var LODOP;//打印机实体对象


    var initPrintParams=function(){
        // {
        //     _orderChageng//单号
        //     printer//打印机对象
        //     printerName//打印机名
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


    var initPrinter=function (printerData){
        LODOP=getLodop();
        LODOP.PRINT_INIT("");
        // LODOP.SET_PRINT_PAGESIZE(3,880,100,"");
        _.each(printerData,function (printer){
            // printers中没有默认打印机
            var pr=getPrinter(printer.name);
            if(pr){
                var printerObj={
                    // printer:pr,//打印机对象
                    printerName:printer.name,//打印机名
                    isPrintOrder:printer.isPrintOrder,
                    isPrintPanAndSoup:printer.isPrintPanAndSoup,
                    isPrintProduct:printer.isPrintProduct,
                    productCategory:printer.productCategory
                }
                //默认为第一满足条件的
                if(!defaultPrinter){
                    var name=getDefaultPrinterName();
                    if(name==printerObj.printerName){
                        defaultPrinter=printerObj;
                    }
                }else{
                    printers.push(printerObj);
                }
                //默认为第一满足条件的
                if(!panSoupPrinter&&printerObj.isPrintPanAndSoup){
                    panSoupPrinter=printerObj;
                }
            }else{
                printersInitErr.push(printer.name);
            }
            
        });
        if(!defaultPrinter){
            alert(self.languagePack.restaurant.printer.defaultPrinterIniteErr);
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
            self.testChange=data.order_changes[0];
            if(cb){
                cb();
            }
        });
    };

    var automaticPrint=function(){
        // 如果没有初始化出默认打印机，报错
        if(defaultPrinter){
            //主流程定时器，打印执行
            var beginAutoPrint=function(){
                getChange(function(){
                    while(self.order_changes.length>0){
                        dealChange(self.order_changes[0]);
                    }
                    // _.each(self.order_changes,function (order_change){
                    //     dealChange(order_change);
                    // });  
                });
            };
            beginAutoPrint();
            intervalId=setInterval(function(){
                beginAutoPrint();
            },300000);//5*60*1000
            //检查流程定时器，结果判断jobs
            //该定时器自检关闭
            if(checkJobIntervalId==""){
                checkJobIntervalId=setInterval(function(){
                    var length=jobs.length;
                    var now=new Date();
                    if(length==0&&intervalId==""){
                        clearInterval(checkJobIntervalId);
                        checkJobIntervalId="";
                    }
                    for(var i=0;i<jobs.length;i++){
                        switch(job_status(jobs[i])){
                            case 0://失败
                                var errJob=jobs.splice(i,1);
                                errJob[0].errorDate=new Date();
                                errJobs.push(errJob[0]);
                                break;
                            case 1://成功
                                jobs.splice(i,1);
                                break;
                            case 2:
                                // //设置超时
                                // if(overtime<(now-job[i].createDate)){
                                //     var errJob=jobs.splice(i,1);
                                //     errJobs.push(errJob[0]);
                                // }
                                break;
                        }
                    }
                    // console.log(errJobs);
                },60000);//60*1000
            }
        }else{
            alert(self.languagePack.restaurant.printer.defaultPrinterIniteErr);
            // loadAndInitPrinters();
        }
        
        
    };

    var stopPrint=function(){
        if(intervalId!=""){
            clearInterval(intervalId);
            intervalId="";
        }
    };

    //载入打印机
    var loadAndInitPrinters=function(){
        Printer.index({},{},function (data){
            initPrinter(data.prints);
        },function(){

        });

    };

    //检查X打印机是否能打印改产品
    var isAbleToPrint=function (printer,product){
        if(printer.isPrintProduct){
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
            var c=_.findWhere(self.printProductArr,{printer:printer});
            if(c){
                c.products.push(product);
            }else{
                var obj={
                    _orderChageng:order_change._id,
                    // printer:printer.printer,//打印机对象
                    printerName:printer.printerName,//打印机名
                    order_change:order_change,//对象
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
        if(getPRINT_STATUS_OK(job)){
            return 1;//打印完毕
        }
        if(!getPRINT_STATUS_EXIST(job)){
            return 0;//打印任务失败
        }
        return 2;//尚未打印，还在打印列表中
    };

    //修改orderChange状态
    var dealOrderChangeById=function (id){
        var c=_.findWhere(self.order_changes,{_id:id});
        self.order_changes.splice(self.order_changes.indexOf(c),1);
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
        }
        
        // var htmlStr='';
    };

    //生成product打印模板
    var initProductModel=function(){
        var status=self.printProduct.order_change.state;
        var createDate=new Date(self.printProduct.order_change.createDate);
        var str='<div style="font-size:38px;word-wrap:break-word;word-break:break-all;width:260px;padding:0 20px;">';
        str+='<div style="text-align:left;">';
        //table
        str+='<div><div style="font-size:38px;width:60px;float:left">2222桌号:</div>';
        str+='<div style="width:140px;float:left;font-size:20px;font-weight:600;">'+self.printProduct.order_change.table.name+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:60px;float:left">Table:</div>';
        str+='<div style="width:140px;float:left;font-size:20px;font-weight:600;">'+self.printProduct.order_change.table.name+'</div>';
        str+='<div style="clear:both"></div></div>';
        //订单状态
        str+='<div><div style="width:100px;float:left">订单状态:</div>';
        str+='<div style="width:140px;float:left">'+(status==2?'下单':'加单')+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:80px;float:left">Order State::</div>';
        str+='<div style="width:140px;float:left">'+(status==2?'New':'Add')+'</div>';
        str+='<div style="clear:both"></div></div>';
        //日期
        str+='<div><div style="width:40px;float:left">日期:</div>';
        str+='<div style="width:90px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div style="width:40px;float:left">时间:</div>';
        str+='<div style="width:50px;float:left">'+createDate.Format("hh:mm")+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:40px;float:left">Date:</div>';
        str+='<div style="width:90px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div style="width:40px;float:left">Time:</div>';
        str+='<div style="width:50px;float:left">'+createDate.Format("hh:mm")+'</div>';
        str+='<div style="clear:both"></div></div>';
        //单号，order_change
        str+='<div><div style="width:60px;float:left">单号:</div>';
        str+='<div style="width:200px;float:left">'+self.printProduct.order_change._id+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:60px;float:left">NO.:</div>';
        str+='<div style="width:200px;float:left">'+self.printProduct.order_change._id+'</div>';
        str+='<div style="clear:both"></div></div>';
        //订单号：order
        str+='<div><div style="width:70px;float:left">订单号:</div>';
        str+='<div style="width:200px;float:left">'+self.printProduct.order_change._order+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:70px;float:left">Order NO.:</div>';
        str+='<div style="width:200px;float:left">'+self.printProduct.order_change._order+'</div>';
        str+='<div style="clear:both"></div></div>';
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        //内容部分
        str+='<div>';
        //标题
        str+='<div><div style="width:140px;text-align:left;float:left">品名</div>';
        str+='<div style="width:40px;text-align:center;float:left">数量</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:140px;text-align:left;float:left">Item</div>';
        str+='<div style="width:40px;text-align:center;float:left">Qty</div>';
        str+='<div style="clear:both"></div></div>';
        //product
        _.each(self.printProduct.products,function (product){
            str+='<div><div style="width:140px;text-align:left;float:left">'+product.name+'('+product.name_english+')'+'</div>';
            str+='<div style="width:40px;text-align:center;float:left">'+product.orderQuantity+'</div>';
            str+='<div style="clear:both"></div></div>';
        });
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        return str;
    };

    //生成panSoup打印模板
    var initPanSoupModel=function(){
        var createDate=new Date(self.panSoupData.createDate);
        var str='<div style="font-size:38px;word-wrap:break-word;word-break:break-all;width:260px;padding:0 20px;">';
        str+='<div style="text-align:left;">';
        //table
        str+='<div><div style="width:60px;float:left">桌号:</div>';
        str+='<div style="width:140px;float:left;font-weight:600;">'+self.panSoupData.table.name+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:60px;float:left">Table:</div>';
        str+='<div style="width:140px;float:left;font-weight:600;">'+self.panSoupData.table.name+'</div>';
        str+='<div style="clear:both"></div></div>';
        //日期
        str+='<div><div style="width:60px;float:right">日期:</div>';
        str+='<div style="width:120px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div style="width:60px;float:right">时间:</div>';
        str+='<div style="width:120px;float:left">'+createDate.Format("hh:mm")+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:60px;float:right">Date:</div>';
        str+='<div style="width:120px;float:left">'+createDate.Format("yyyy-MM-dd")+'</div>';
        str+='<div style="width:60px;float:right">Time:</div>';
        str+='<div style="width:120px;float:left">'+createDate.Format("hh:mm")+'</div>';
        str+='<div style="clear:both"></div></div>';
        //单号，order_change
        str+='<div><div style="width:60px;float:left">单号:</div>';
        str+='<div style="width:200px;float:left">'+self.panSoupData._id+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:60px;float:left">NO.:</div>';
        str+='<div style="width:200px;float:left">'+self.panSoupData._id+'</div>';
        str+='<div style="clear:both"></div></div>';
        //订单号：order
        str+='<div><div style="width:70px;float:left">订单号:</div>';
        str+='<div style="width:200px;float:left">'+self.panSoupData._order+'</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:70px;float:left">Order NO.:</div>';
        str+='<div style="width:200px;float:left">'+self.panSoupData._order+'</div>';
        str+='<div style="clear:both"></div></div>';
        //结束及分割线
        str+='</div><hr style=" height:2px;border:none;border-top:2px dotted #000;" />';
        //内容部分
        str+='<div>';
        //标题
        str+='<div><div style="width:90px;text-align:left;float:left">品名</div>';
        str+='<div style="width:130px;text-align:center;float:left">口味</div>';
        str+='<div style="clear:both"></div></div>';
        str+='<div><div style="width:90px;text-align:left;float:left">Item</div>';
        str+='<div style="width:130px;text-align:center;float:left">Attribute</div>';
        str+='<div style="clear:both"></div></div>';
        //锅
        str+='<div><div style="width:90px;text-align:left;float:left">'+self.panSoupData.pan_category.name+'('+self.panSoupData.pan_category.name_english+')'+'</div>';
        str+='<div style="clear:both"></div></div>';
        //汤底
        _.each(self.panSoupData.pan_soups,function (soup){
            str+='<div><div style="width:90px;text-align:left;float:left">'+soup.name+'('+soup.name_english+')'+'</div>';
            str+='<div style="width:130px;text-align:center;float:left">';
            _.each(soup.attribute,function (att){
                str+='<div>'+att.name+'('+att.name_english+')'+':'+att.value.name+'('+att.value.name_english+')'+'</div>';
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
            createDate:new Date()
        };
        jobs.push(job);
        // dealOrderChangeById(self.panSoupData._id);
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
                createDate:new Date()
            };
            jobs.push(job);
        });
        // dealOrderChangeById(self.printProduct._orderChageng);
        self.printProductArr=[];
    };

    var dealChange=function(order_change){
        switch(order_change.state){
            case 1://锅底汤底
                self.panSoupData=order_change;
                beginToPrintPanSoup();
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

    var init=function(){
        initLanguage();
        initPrintParams();
        // loadAndInitPrinters();
        loadAndInitPrinters();
        getChange();
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

    var initLanguage=function(){
    if(!languagePack){
        return;
    }
    self.languagePack=languagePack;
    }

    self.aaa=function(){
        if(intervalId!=""){
            stopPrint();
        }else{
            automaticPrint();
        }
    };

    //人工操作打印
    self.print=function (order_change){
        dealChange(order_change);
    };

    //重新打印某项任务
    self.rePrint=function (job){
        errJobs.splice(errJobs.indexOf(job),1);
        setPrinter(job.printerName);
        // document.getElementById("product").innerHTML=innerHTML('product');//页面显示测试
        LODOP.ADD_PRINT_HTM(0,0,"88mm","BottomMargin:0",job.content);
        var jobId=LODOP.PRINT();
        job.jobId=jobId;
        jobs.push(job);
    };

    init();
    
}]);
