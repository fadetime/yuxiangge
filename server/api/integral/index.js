'use strict';

var express = require('express');
var controller = require('./integral.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);//customer查询跟积分有关的记录
// router.post('/',auth.hasRole(["customer"]), controller.create);
// router.get('/:id', auth.isAuthenticated(), controller.show);

module.exports = router;