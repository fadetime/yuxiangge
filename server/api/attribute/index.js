'use strict';

var express = require('express');
var controller = require('./attribute.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole(['restaurant','admin']), controller.index);
router.post('/', auth.hasRole(['restaurant','admin']), controller.create);
router.delete('/', auth.hasRole(['restaurant','admin']), controller.destroyAll);

module.exports = router;
