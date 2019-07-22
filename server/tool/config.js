//有效时长，单位为分钟
exports.codeVaildTime=8;
//默认税率
exports.gstPercent=0.07;
//默认小费百分比
exports.servicePercent=0;
//默认积分兑换比
exports.ratio=1;
//category的默认序号
exports.defalutSeq=999;
//本地上传的文件存放目录，修改此项请同时修改client端配置：assets/config
//根目录为项目根目录
// exports.localUploadFile="../uploadfile/";//项目外文件上传路径
exports.localUploadFile="../summaryfolder/";//项目内文件上传路径,注意public为grunt build之后的，原文件为client

// exports.localUploadFileImg="client/assets/uploadfile/";//项目内文件上传路径,注意public为grunt build之后的，原文件为client
exports.localUploadFileImg="public/assets/uploadfile/";//项目内文件上传路径,注意public为grunt build之后的，原文件为client

//生成的每日统计保存路基
exports.statisticsFile="summaryfolder/";




exports.ftpHost='10.111.30.36';
exports.ftpPort=21;
exports.ftpUser='ctmposftp';
exports.ftpPassword='ctmposftp';