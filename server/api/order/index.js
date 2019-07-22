'use strict';

var express = require('express');
var controller = require('./order.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.get('/', auth.isAuthenticated(), controller.index);
router.post('/',auth.hasRole(['waiter']), controller.create);
router.post('/start-order/:id', auth.hasRole(['waiter']), controller.order);//用户操作
router.get('/:id', auth.hasRole(['waiter','restaurant','admin']), controller.show);
router.put('/:id', auth.hasRole(['waiter','restaurant','admin']), controller.update);
router.put('/bind-customer/:id', auth.hasRole(['customer','restaurant','admin']), controller.bindCustomer);//将order与指定customer绑定
router.put('/changetable/:id', auth.hasRole(['waiter']), controller.changeTable);//服务员操作换桌
router.get('/reload/bytablename', auth.hasRole(['waiter','restaurant']), controller.reload);//用餐期间崩溃重新载入订单使用
router.put('/bind-account/:id', controller.bindAccount);//将order与指定账号绑定
router.get('/print/ongoingchange', auth.hasRole(['restaurant']), controller.ongoingchange);
router.get('/:id/oneorderchange', auth.hasRole(['restaurant']), controller.oneorderchange);
router.get('/print/index', auth.hasRole(['restaurant']), controller.index);
router.put('/dealchange/:id', auth.hasRole(['waiter','restaurant']), controller.dealChange);
router.put('/change/deliver/:id', auth.hasRole(['waiter']), controller.changeDeliver);
router.get('/statistics/bydate', auth.hasRole(['restaurant']), controller.statistic);
router.get('/statistics/onedaydate', controller.getStatistic);
router.put('/changePrintState/:id', auth.hasRole(['restaurant','waiter']), controller.changePrintState);

module.exports = router;