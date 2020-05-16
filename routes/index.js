'use strict';

const express = require('express');
const HelloWorld = require('./requests/HelloWorld');

const router = express.Router();

router.get('/HelloWorld', HelloWorld.test);

module.exports = router;