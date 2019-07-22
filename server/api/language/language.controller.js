/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /customers              ->  index
 * POST    /customers              ->  create
 * GET     /customers/:id          ->  show
 * PUT     /customers/:id          ->  update
 */

'use strict';

var _ = require('lodash');
var englishPack = require('./pack/english');
var chinesePack = require('./pack/chinese');

exports.getPack=function (req,res){
	var pack = req.query.pack;
	var lang = {};
	if(pack == 'chinese'){
		lang = {
			edition:chinesePack.edition,
			navbar:chinesePack.navbar,
			restaurant:chinesePack.restaurant,
			admin:chinesePack.admin,
			error:chinesePack.error
		};
		res.json(200,lang);
	}else{
		lang = {
			edition:englishPack.edition,
			navbar:englishPack.navbar,
			restaurant:englishPack.restaurant,
			admin:englishPack.admin,
			error:englishPack.error
		};
		res.json(200,lang);
	}
  
};

