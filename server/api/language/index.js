'use strict';

var express = require('express');
var controller = require('./language.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/pack',controller.getPack);


module.exports = router;
