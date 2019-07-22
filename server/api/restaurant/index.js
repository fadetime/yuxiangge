'use strict';

var express = require('express');
var controller = require('./restaurant.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['admin']), controller.index);
router.post('/branch', auth.hasRole(['restaurant']), controller.createBranch);//餐厅下设分店
router.post('/', auth.hasRole(['admin']), controller.create);
router.get('/:id', auth.hasRole(['admin','waiter']), controller.show);
router.put('/update/selfinfo', auth.hasRole(['restaurant']), controller.update);//餐厅更新自己信息

module.exports = router;