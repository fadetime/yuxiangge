var stateCode = require('./statecode');
var _ = require('lodash');
var fs = require('fs');
var config = require('./config');

//获取这个时间点的开始或者结束时间,str=start||end
exports.getTimePoint=function(date,str){
	var reslut=new Date(date.getTime());
	if(str=="start"){
		reslut.setHours(0);
		reslut.setMinutes(0);
		reslut.setSeconds(0);
		reslut.setMilliseconds(1);
	}else{
		reslut.setHours(23);
		reslut.setMinutes(59);
		reslut.setSeconds(59);
		reslut.setMilliseconds(999);
	}
	return reslut;
};

//保留两位小数
exports.dealNumber=function(num,str){
  var num2=num.toFixed(3);
  if(str){
  	return num2.substring(0,num2.lastIndexOf('.')+3);
  }else{
  	return  parseFloat(num2.substring(0,num2.lastIndexOf('.')+3));
  }
};

//检查是否是小于0的数
exports.isInvalidNum=function(num){
	// console.log(num&&(isNaN(num)||num<0));
	return num&&(isNaN(num)||num<0);
};

//验证手机号码规范，新加坡
exports.regexTel=function(str){
	var regex=/^\d{8}$/;
	return regex.test(str);
};

//将数组转换成对象数组
//bson数组用
exports.toObjectArr=function (arr){
	var len=arr.length;
	for(var i=0;i<len;i++){
		arr[i]=arr[i].toObject();
	}
	return arr;
};

//获取不重复的数组
exports.getNoRepeatArr=function (arr){
	var newArr=[];
	_.each(arr,function (sign){
		if(newArr.indexOf(sign)==-1){
			newArr.push(sign);
		}
	});
	return newArr;
};

//字符串不为空或null
exports.strIsValued=function (str){
	var open=true;
	if(!str||str==""){
		open=false;
	}
	return open;
};

//写出每天统计的销售文件文件
exports.writerTXT = function (opt,cb){  
    var newLine='\r\n';
    var chunks=[];  
    var length=0;  
    var arr = opt.arr;
    var fileName = opt.fileName+".txt";
      
    for(var i=0,arrLength=arr.length;i<arrLength;i++){  

        var value=arr[i]+newLine;  
        var buffer=new Buffer(value);  
        chunks.push(buffer);  
        length+=buffer.length;  
    }  
      
    var resultBuffer=new Buffer(length);  
    for(var i=0,size=chunks.length,pos=0;i<size;i++){  
        chunks[i].copy(resultBuffer,pos);  
        pos+=chunks[i].length;  
    }  

    console.log(__dirname+"/../../"+config.localUploadFile+fileName);
      
    fs.writeFile(__dirname+"/../../"+config.localUploadFile+fileName,resultBuffer,function(err){  
        if(err) throw err;  
        cb(fileName); 
    });  
};

//根据文件名 读取文件
exports.readFile = function (fileName,res){
	var currFile = __dirname+"/../../"+config.localUploadFile+fileName;
	fs.exists(currFile,function(exist) {
        if(exist){
            res.set({
                "Content-type":"application/octet-stream",
                "Content-Disposition":"attachment;filename="+encodeURI(fileName)
            });
            var fReadStream = fs.createReadStream(currFile);
            fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
            fReadStream.on("end",function () {
                res.end();
            });
        }else{
            res.set("Content-type","text/html");
            res.send("file not exist!");
            res.end();
        }
    });
};


//发送验证码成功
exports.code100=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code100.code,
			msg:stateCode.code100.msg_english
		};
	}else{
		msg={
			code:stateCode.code100.code,
			msg:stateCode.code100.msg_chinese
		};
	}
	return msg;
};

//发送验证码失败
exports.code101=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code101.code,
			msg:stateCode.code101.msg_english
		};
	}else{
		msg={
			code:stateCode.code101.code,
			msg:stateCode.code101.msg_chinese
		};
	}
	return msg;
};

//账号不符合手机规范
exports.code102=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code102.code,
			msg:stateCode.code102.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code102.code,
			msg:stateCode.code102.msg_chinese+":"+params
		};
	}
	return msg;
};

//账号未注册
exports.code103=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code103.code,
			msg:stateCode.code103.msg_english
		};
	}else{
		msg={
			code:stateCode.code103.code,
			msg:stateCode.code103.msg_chinese
		};
	}
	return msg;
};

//账号或密码错误
exports.code104=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code104.code,
			msg:stateCode.code104.msg_english
		};
	}else{
		msg={
			code:stateCode.code104.code,
			msg:stateCode.code104.msg_chinese
		};
	}
	return msg;
};

//账号已被使用
exports.code111=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code111.code,
			msg:stateCode.code111.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code111.code,
			msg:stateCode.code111.msg_chinese+":"+params
		};
	}
	return msg;
};

//验证码错误
exports.code112=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code112.code,
			msg:stateCode.code112.msg_english
		};
	}else{
		msg={
			code:stateCode.code112.code,
			msg:stateCode.code112.msg_chinese
		};
	}
	return msg;
};

//验证码失效
exports.code113=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code113.code,
			msg:stateCode.code113.msg_english
		};
	}else{
		msg={
			code:stateCode.code113.code,
			msg:stateCode.code113.msg_chinese
		};
	}
	return msg;
};

//餐桌已被使用
exports.code114=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code114.code,
			msg:stateCode.code114.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code114.code,
			msg:stateCode.code114.msg_chinese+":"+params
		};
	}
	return msg;
};

//该礼品已全被兑换或下架
exports.code115=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code115.code,
			msg:stateCode.code115.msg_english
		};
	}else{
		msg={
			code:stateCode.code115.code,
			msg:stateCode.code115.msg_chinese
		};
	}
	return msg;
};
//积分不足
exports.code116=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code116.code,
			msg:stateCode.code116.msg_english
		};
	}else{
		msg={
			code:stateCode.code116.code,
			msg:stateCode.code116.msg_chinese
		};
	}
	return msg;
};
//分店不能下设餐厅
exports.code117=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code117.code,
			msg:stateCode.code117.msg_english
		};
	}else{
		msg={
			code:stateCode.code117.code,
			msg:stateCode.code117.msg_chinese
		};
	}
	return msg;
};

//账号或密码错误
exports.code201=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code201.code,
			msg:stateCode.code201.msg_english
		};
	}else{
		msg={
			code:stateCode.code201.code,
			msg:stateCode.code201.msg_chinese
		};
	}
	return msg;
};

//报错处理,创建缺少参数
exports.code301=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code301.code,
			msg:stateCode.code301.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code301.code,
			msg:stateCode.code301.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,创建参数错误
exports.code302=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code302.code,
			msg:stateCode.code302.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code302.code,
			msg:stateCode.code302.msg_chinese+":"+params
		};
	}
	return msg;
};

//更新成功
exports.code400=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code400.code,
			msg:stateCode.code400.msg_english
		};
	}else{
		msg={
			code:stateCode.code400.code,
			msg:stateCode.code400.msg_chinese
		};
	}
	return msg;
};

//报错处理,更新缺少参数
exports.code401=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code401.code,
			msg:stateCode.code401.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code401.code,
			msg:stateCode.code401.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,更新参数错误
exports.code402=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code402.code,
			msg:stateCode.code402.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code402.code,
			msg:stateCode.code402.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,口令错误
exports.code403=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code403.code,
			msg:stateCode.code403.msg_english
		};
	}else{
		msg={
			code:stateCode.code403.code,
			msg:stateCode.code403.msg_chinese
		};
	}
	return msg;
};

//报错处理,查询不到结果
exports.code404=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code404.code,
			msg:stateCode.code404.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code404.code,
			msg:stateCode.code404.msg_chinese+":"+params
		};
	}
	return msg;
};
//在此状态下订单不允许进行此操作
exports.code405=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code405.code,
			msg:stateCode.code405.msg_english
		};
	}else{
		msg={
			code:stateCode.code405.code,
			msg:stateCode.code405.msg_chinese
		};
	}
	return msg;
};

//信息不完整，请先完善信息
exports.code406=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code406.code,
			msg:stateCode.code406.msg_english
		};
	}else{
		msg={
			code:stateCode.code406.code,
			msg:stateCode.code406.msg_chinese
		};
	}
	return msg;
};

//订单只能与一个用户绑定
exports.code407=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code407.code,
			msg:stateCode.code407.msg_english
		};
	}else{
		msg={
			code:stateCode.code407.code,
			msg:stateCode.code407.msg_chinese
		};
	}
	return msg;
};

//报错处理,查询缺少参数
exports.code501=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code501.code,
			msg:stateCode.code501.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code501.code,
			msg:stateCode.code501.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,查询参数错误
exports.code502=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code502.code,
			msg:stateCode.code502.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code502.code,
			msg:stateCode.code502.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,删除缺少参数
exports.code601=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code601.code,
			msg:stateCode.code601.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code601.code,
			msg:stateCode.code601.msg_chinese+":"+params
		};
	}
	return msg;
};

//报错处理,删除参数错误
exports.code602=function(language,params){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code602.code,
			msg:stateCode.code602.msg_english+":"+params
		};
	}else{
		msg={
			code:stateCode.code602.code,
			msg:stateCode.code602.msg_chinese+":"+params
		};
	}
	return msg;
};
//上传成功
exports.code700=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code700.code,
			msg:stateCode.code700.msg_english
		};
	}else{
		msg={
			code:stateCode.code700.code,
			msg:stateCode.code700.msg_chinese
		};
	}
	return msg;
};
//上传失败
exports.code701=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code701.code,
			msg:stateCode.code701.msg_english
		};
	}else{
		msg={
			code:stateCode.code701.code,
			msg:stateCode.code701.msg_chinese
		};
	}
	return msg;
};
//删除成功
exports.code800=function(language){
	var msg;
	if(language=="english"){
		msg={
			code:stateCode.code800.code,
			msg:stateCode.code800.msg_english
		};
	}else{
		msg={
			code:stateCode.code800.code,
			msg:stateCode.code800.msg_chinese
		};
	}
	return msg;
};

