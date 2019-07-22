'use strict';

var express = require('express');
var controller = require('./customer.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.get('/', auth.hasRole(['restaurant']), controller.index);
router.post('/', controller.create);
router.get('/', auth.hasRole(['admin']), controller.index);
router.get('/:id', auth.hasRole(['admin']), controller.show);
router.put('/:id', auth.hasRole(['admin','customer']), controller.update);

module.exports = router;