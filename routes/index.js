'use strict';

const express = require('express');
const avalon = require('./clients/avalon');

const router = express.Router();

router.put('/avalon/create', avalon.create);

module.exports = router;