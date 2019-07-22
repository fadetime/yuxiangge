'use strict';

var express = require('express');
var controller = require('./product.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','waiter']), controller.index);
router.get('/classify', auth.hasRole(['waiter']), controller.classify);
router.post('/', auth.hasRole(['restaurant','admin']), controller.create);
router.post('/arrbyid', auth.hasRole(['waiter']), controller.showArr);//根据id获取对应语言的pr数组
router.get('/:id', auth.hasRole(['restaurant','waiter']), controller.show);
router.put('/:id', auth.hasRole(['admin','restaurant']), controller.update);
router.put('/changestate/:id', auth.hasRole(['admin','restaurant']), controller.changeState);//修改额外收费项目状态
router.delete('/:id',auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;
