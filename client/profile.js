'use strict';

function getPlayerName(req, res) {
  res.send("Foolish");
}

function setPlayerName(req, res) {
  res.end();
}

module.exports = {
  getPlayerName,
  setPlayerName
};