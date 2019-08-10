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
    this.changes = {};
  }
  
  toJSON() {
    return {
      title: this.title,
      settings: this.settings.toJSON(),
      state: this.state,
      players: this.players
    }
  }
  
  cleanChanges() {
    if (Object.keys(this.changes).length === 0) {
      return null;
    }
    const changes = this.changes;
    this.changes = {};
    return changes;
  }
  
  changeSettings(settings) {
    const err = this.settings.change(settings);
    if (!err) {
      this.changes.settings = this.settings.cleanChanges();
    }
    return err;
  }
  
  action(action, data) {
    switch (action) {
      case 'start':
        return this.start(data);
      default:
        return `Invalid game action (${action})`;
    }
  }
  
  getPlayerSecrets() {
    return this.secrets;
  }
  
  start(data) {
    data.players = [{id: "id1", name: "Test1", host: true}, {id: "id2", name: "Test2", host: false}, {id: "id3", name: "Test3", host: false}, {id: "id4", name: "Test4", host: false}, {id: "id5", name: "Test5", host: false}];
    if (data.players.length < this.settings.minPlayers || data.players.length > this.settings.maxPlayers) {
      return "Invalid number of players";
    } else if (data.players.length !== this.settings.selectedCards.good.length + this.settings.selectedCards.evil.length) {
      return "Invalid number of selected cards";
    }
    
    this.state = {};
    this.players = data.players.map(player => {return {id: player.id, name: player.name}})
    this.changes.state = this.state;
    this.changes.players = this.players;
    const players = data.players.map(player => {return {id: player.id}});
    
    this.secrets = {};
    this.distributeCards(players);
    for (const player of players) {
      this.secrets[player.id] = {card: player.card};
    }
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