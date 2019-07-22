'use strict';

var express = require('express');
var controller = require('./gift.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','admin','waiter']), controller.index);
router.post('/',auth.hasRole(['restaurant','admin']), controller.create);
router.post('/exchange',auth.hasRole(["customer"]), controller.exchange);
router.get('/:id', auth.hasRole(['restaurant','admin','customer','waiter']), controller.show);
router.put('/:id',auth.hasRole(['restaurant','admin']), controller.update);
router.put('/changestate/:id', auth.hasRole(['admin','restaurant']), controller.changeState);//修改礼品状态
router.delete('/:id', auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;