'use strict';

var express = require('express');
var controller = require('./extra.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','waiter','admin']), controller.index);
router.post('/', auth.hasRole(['restaurant','admin']),controller.create);
// router.get('/', auth.hasRole(['restaurant','admin']), controller.index);
router.get('/:id', auth.hasRole(['restaurant','admin']), controller.show);
router.put('/:id', auth.hasRole(['admin','restaurant']), controller.update);
router.put('/changestate/:id', auth.hasRole(['admin','restaurant']), controller.changeState);//修改额外收费项目状态
router.delete('/:id',auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;