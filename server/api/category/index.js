'use strict';

var express = require('express');
var controller = require('./category.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','waiter']), controller.index);
router.post('/', auth.hasRole(['restaurant','admin']), controller.create);
router.put('/sort', auth.hasRole(['restaurant','admin']), controller.updateSeq);
router.put('/:id', auth.hasRole(['restaurant','admin']), controller.update);
router.get('/:id', auth.hasRole(['restaurant','waiter']), controller.show);
router.delete('/:id', auth.hasRole(['restaurant','waiter']), controller.destory);

module.exports = router;
