'use strict';

var express = require('express');
var controller = require('./print.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', auth.hasRole(['restaurant','admin']), controller.create);
router.get('/', auth.hasRole(['restaurant','admin']), controller.index);
router.get('/:id', auth.hasRole(['restaurant','admin']), controller.show);
router.put('/:id', auth.hasRole(['restaurant','admin']), controller.update);
// router.put('/:id/changeState', auth.hasRole(['restaurant','admin']), controller.changeState);
router.delete('/:id', auth.hasRole(['restaurant','admin']), controller.destroy);

module.exports = router;
