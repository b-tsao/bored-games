'use strict';

const log4js = require('log4js');

const AvalonSettings = require('./AvalonSettings');

const logger = log4js.getLogger('Avalon');

class Avalon {
  constructor() {
    this.title = 'The Resistance: Avalon';
    this.settings = new AvalonSettings();
    this.state = null;
    this.players = null;
    this.secrets = {};
  }
  
  toJSON() {
    return {
      title: this.title,
      settings: this.settings.toJSON(),
      state: this.state,
      players: this.players
    }
  }
  
  changeSettings(settings, callback = () => {}) {
    const err = this.settings.change(settings, (err, changes) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, {settings: changes});
      }
    });
  }
  
  action(action, data, callback = () => {}) {
    switch (action) {
      case 'start':
        return this.start(data, callback);
      default:
        return callback(`Invalid game action (${action})`);
    }
  }
  
  start(data, callback = () => {}) {
    let i = data.players.length + 1;
    while (i <= 5) {
      data.players.push({id: "id" + i, name: "Test" + i, host: false});
      i++;
    }
    if (data.players.length < this.settings.minPlayers || data.players.length > this.settings.maxPlayers) {
      return callback("Invalid number of players");
    } else if (data.players.length !== this.settings.selectedCards.good.length + this.settings.selectedCards.evil.length) {
      return callback("Invalid number of selected cards");
    }
    
    const changes = {};
    this.state = {};
    this.players = data.players.map(player => {return {id: player.id, name: player.name}})
    changes.state = this.state;
    changes.players = this.players;
    const players = data.players.map(player => {return {id: player.id}});
    
    this.distributeCards(players);
    for (const player of players) {
      this.secrets[player.id] = {card: player.card};
    }
    
    return callback(null, changes, this.secrets);
  }
  
  distributeCards(players) {
    const shuffledIdx = this.shuffle(Object.keys(players));
    
    let i = 0;
    let idx = 0;
    while (i < this.settings.selectedCards.good.length) {
      players[shuffledIdx[idx++]].card = {
        side: 'good',
        idx: this.settings.selectedCards.good[i++]
      };
    }
    i = 0;
    while (i < this.settings.selectedCards.evil.length) {
      players[shuffledIdx[idx++]].card = {
        side: 'evil',
        idx: this.settings.selectedCards.evil[i++]
      };
    }
  }
  
  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }
}

module.exports = Avalon;