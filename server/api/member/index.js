'use strict';

var express = require('express');
var controller = require('./member.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant']), controller.index);
// router.post('/', controller.create);
router.get('/:id', auth.hasRole(['restaurant']), controller.show);
router.put('/update-integral', auth.hasRole(['restaurant']), controller.update);
// router.get('/', auth.hasRole(['restaurant','admin']), controller.index);

module.exports = router;