var Order = require('../order/order.model');
var orderController = require('../order/order.controller');
var Restaurant = require('../restaurant/restaurant.model');
var util = require('../../tool/util');
var config = require('../../tool/config');



setInterval(function (){
    var now=new Date();
    var hours = now.getHours();
    var startDate = util.getTimePoint(new Date(parseInt(now.getTime())),"start");
    var endDate = util.getTimePoint(new Date(parseInt(now.getTime())),"end");
    Restaurant.findOne({},function (err, restaurant){
      if(err || !restaurant){return;}
      var condition={
        _restaurant:restaurant._id,
        status:4,
        createDate:{$gte:startDate,$lte:endDate}
      };
      if(hours==23){
        Order.find(condition,function (err,orders){
          condition={
            _restaurant:restaurant._id,
            startDate:startDate
          };
          orderController.createTxt(orders,condition,function (err,opt){
            if (err) { return; }
            util.writerTXT(opt,function(fileName){
              console.log('1');
              ftp(opt);
            });
            
          });
        });
      }
    });
},1000*60*60);


var ftp=function (opt){
  var Client = require('ftp');
  var fs = require('fs');

  var c = new Client();
  var name='/'+opt.fileName+'.txt';
  c.on('ready', function() {
    c.put(opt.arr[0], name, function(err) {
      if (err) throw err;
      c.end();
    });
  });
  // connect to localhost:21 as anonymous
  c.connect({host:config.ftpHost,port:config.ftpPort,user:config.ftpUser,password:config.ftpPassword});
};
exports.ftp=ftp;