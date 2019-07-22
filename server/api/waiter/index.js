'use strict';

var express = require('express');
var controller = require('./waiter.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','admin']), controller.index);
router.post('/',auth.hasRole(['restaurant','admin']), controller.create);
router.post('/check/authpassword', auth.hasRole(['waiter']), controller.checkAuthPassword);
router.put('/:id',auth.hasRole(['restaurant','admin','waiter']), controller.update);
router.delete('/:id',auth.hasRole(['admin','restaurant']), controller.destroy);

module.exports = router;