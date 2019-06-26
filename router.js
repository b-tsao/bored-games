'use strict';

const express = require('express');
const avalon = require('./client/avalon');

const router = express.Router({mergeParams: true});

router.post('/avalon/spectate', avalon.spectate);

module.exports = router;