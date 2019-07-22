'use strict';

var express = require('express');
var controller = require('./pan_soup.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','waiter']), controller.index);
router.post('/', auth.hasRole(['restaurant','admin']), controller.create);
router.get('/:id', auth.hasRole(['restaurant','waiter']), controller.show);
router.put('/:id', auth.hasRole(['admin','restaurant']), controller.update);
router.put('/changestate/:id', auth.hasRole(['admin','restaurant']), controller.changeState);//修改汤底状态
router.delete('/:id',auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;
