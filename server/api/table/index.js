'use strict';

var express = require('express');
var controller = require('./table.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','waiter']), controller.index);
router.post('/', auth.hasRole(['restaurant']), controller.create);
router.get('/:id', auth.hasRole(['restaurant','waiter']), controller.show);
router.put('/:id', auth.hasRole(['restaurant']), controller.update);
router.put('/unlock/:id',auth.hasRole(['restaurant']),  controller.unlockTable);
router.delete('/:id',auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;