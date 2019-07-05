Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

// 调用： 
var time1 = new Date().Format("yyyy-MM-dd");
var time2 = new Date().Format("hh:mm:ss");  
console.log(time1,time2);











var index=0;
var getObj = function(){
    var g = $.createShape({x:0,y:350,lifeTime:10,rotationX:30});
    // g.graphics.beginGradientFill("linear", [0xFF0000, 0x00FF00,0x0000FF],[1,1,1],[0x00,0x7f,0xff] , $.createGradientBox(20, 20, 0, 0, 0),"reflect","rgb",0);
    g.graphics.lineStyle(1, 0xff0000, 0, false, "vertical","none", "miter", 10);
    g.graphics.beginFill(0xff0000,0.5);
    g.graphics.lineTo(1300,-350);
    g.graphics.lineTo(1300,350);
    g.graphics.endFill();
    return g;
};

// index++;
// var intervalId=setinterval(function(){

// },1000);

// var moveLine = function (g){
//     y=index*100-350;

// };


var obj1 = getObj();

var getObj = function(){
    var g = $.createShape({x:0,y:350,lifeTime:10,motion:{
        rotationX:{fromValue:0,toValue:90,lifeTime:3},
        rotationY:{fromValue:0,toValue:90,lifeTime:3}
    }});
    // g.graphics.beginGradientFill("linear", [0xFF0000, 0x00FF00,0x0000FF],[1,1,1],[0x00,0x7f,0xff] , $.createGradientBox(20, 20, 0, 0, 0),"reflect","rgb",0);
    g.graphics.lineStyle(1, 0xff0000, 0, false, "vertical","none", "miter", 10);
    g.graphics.beginFill(0xff0000,0.5);
    g.graphics.lineTo(500,-350);
    g.graphics.lineTo(500,350);
    g.graphics.endFill();
    return g;
};

var obj1 = getObj();

