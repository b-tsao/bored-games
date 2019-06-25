'use strict';

const express = require('express');
const profile = require('./client/profile');

const router = express.Router();

router.get('/getPlayerName', profile.getPlayerName);
router.put('/setPlayerName', profile.setPlayerName);

module.exports = router;