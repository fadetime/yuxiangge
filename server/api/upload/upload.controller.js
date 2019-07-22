'use strict';

var _ = require('lodash');
var fs = require('fs');
var config = require('../../tool/config');
var util = require('../../tool/util');
// var ImageGroup = require('../image-group/image-group.model');


exports.upload=function (req,res){
	var data = _.pick(req.body, 'type'), 
		file = req.files.file,
		language=req.headers.language;

        // console.log(file); //original name (ie: sunset.png)
        // console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
        // console.log(file.name);
        var filename=req.body.filename;
        fs.rename(file.path,__dirname+"/../../../"+config.localUploadFileImg+filename,function(err){
			 if(err){
			    console.log("重命名失败！",err);
			    return res.json(200,util.code701(language));
			 }else{
			    console.log("重命名成功！");
			    return res.json(200,util.code700(language));
			 }
		});
    // console.log(uploadPath); //uploads directory: (ie: /home/user/data/uploads)
	// return res.json(200);
};	
