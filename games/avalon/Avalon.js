'use strict';

const log4js = require('log4js');

const AvalonSettings = require('./AvalonSettings');
const PeopleManager = require('../PeopleManager');

const logger = log4js.getLogger('Avalon');

class Avalon {
  constructor() {
    this.title = 'The Resistance: Avalon';
    this.settings = new AvalonSettings();
    this.state = null;
    this.secrets = {};
  }
  
  toJSON() {
    return {
      title: this.title,
      settings: this.settings.toJSON(),
      state: this.state ? {
        ...this.state,
        team: this.state.team.toJSON(),
        votes: this.state.votes.toJSON().map(vote => {return vote.id}), // hide the actual vote
        people: this.state.players.toJSON()
      } : null
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
  
  action(id, action, data, callback = () => {}) {
    const cb = (err, changes) => {
      if (err) {
        return callback(err);
      } else {
        return callback(err, changes, this.secrets); 
      }
    };
    
    switch (action) {
      case 'start':
        return this.start(data, cb);
      case 'choose':
        return this.choose(id, data, cb);
      case 'propose':
        return this.propose(id, cb);
      case 'vote':
        return this.vote(id, data, cb);
      case 'connected':
        return this.connected(id, true, cb);
      case 'disconnected':
        return this.connected(id, false, cb);
      default:
        return cb(`Invalid game action (${action})`);
    }
  }
  
  start(data, callback = () => {}) {
    // DEBUG TEST ONLY BEGIN
    let i = data.players.length + 1;
    while (i <= this.settings.minPlayers) {
      data.players.add({id: "id" + i, name: "TestBot" + i, host: false});
      i++;
    }
    // DEBUG TEST ONLY END
    if (data.players.length < this.settings.minPlayers || data.players.length > this.settings.maxPlayers) {
      return callback("Invalid number of players");
    } else if (data.players.length !== this.settings.selectedCards.good.length + this.settings.selectedCards.evil.length) {
      return callback("Invalid number of selected cards");
    }
    
    const changes = {};
    const comparator = (c1, c2) => {
      if (c1.id < c2.id) return -1;
      else if (c1.id > c2.id) return 1;
      else return 0;
    };
    this.state = {
      players: data.players.map(player => {return {id: player.id, name: player.name}}),
      phase: 'choosing',
      message: '',
      leader: Math.floor(Math.random() * (data.players.length)),
      team: new PeopleManager(), // [<player.name>]
      votes: new PeopleManager(comparator), // [{<player.id>: <Boolean>}]
      missions: [{history: []}], // [{success: <Boolean>, history: [{team: [<player.name>], votes: {<player.name>: <Boolean>}]}]
      rejects: [] // [{team: [<player.name>], votes: {<player.name>: <Boolean>}}] // rejects will be copied into history after every mission
    };
    this.state.leader = 0; // DEBUG TEST ONLY
    this.state.message = this.state.players.people[this.state.leader].name + ' is choosing a team';
    changes.state = this.toJSON().state;
    
    const players = data.players.people.map(player => {return {id: player.id}});
    this.distributeCards(players);
    // Process card information secrets
    for (const player of players) {
      const secret = {[player.id]: {card: player.card}};
      const cardId = this.settings.cards[player.card.side][player.card.idx].id;
      switch (cardId) {
        case 'merlin':
          for (const player of players) {
            const playerCardId = this.settings.cards[player.card.side][player.card.idx].id;
            if (player.card.side === 'evil' && playerCardId !== 'mordred') {
              if (!secret[player.id]) {
                secret[player.id] = {};
              }
              secret[player.id].evil = true;
            }
          }
          break;
        case 'percival':
          for (const player of players) {
            const playerCardId = this.settings.cards[player.card.side][player.card.idx].id;
            if (playerCardId === 'merlin' || playerCardId === 'morgana') {
              if (!secret[player.id]) {
                secret[player.id] = {};
              }
              secret[player.id].merlin = true;
            }
          }
          break;
      }
      if (player.card.side === 'evil' && cardId !== 'oberon') {
        for (const player of players) {
          const playerCardId = this.settings.cards[player.card.side][player.card.idx].id;
          if (player.card.side === 'evil' && playerCardId !== 'oberon') {
            if (!secret[player.id]) {
              secret[player.id] = {};
            }
            secret[player.id].evil = true;
          }
        }
      }
      this.secrets[player.id] = secret;
    }
    
    return callback(null, changes);
  }
  
  choose(id, data, callback = () => {}) {
    let changes = null;
    if (this.state && this.state.phase === 'choosing') {
      const leader = this.state.players.people[this.state.leader];
      const selectedBoard = this.settings.boards[this.settings.selectedBoard];
      const currentMission = selectedBoard.missions[this.state.missions.length - 1];
      if (id === leader.id) {
        if (this.state.team.remove(data.id) ||
           (this.state.team.length < currentMission.team && this.state.team.add(data.id))) {
          changes = {
            state: {
              team: this.state.team.toJSON()
            }
          };
        }
      } else {
        return callback('Only the leader can choose');
      }
    } else {
      return callback('Game is not in the choosing phase');
    }
    return callback(null, changes);
  }
  
  propose(id, callback = () => {}) {
    let changes = null;
    if (this.state && this.state.phase === 'choosing') {
      const leader = this.state.players.people[this.state.leader];
      if (id === leader.id) {
        this.state.phase = 'voting';
        changes = {
          state: {
            phase: this.state.phase
          }
        };
      } else {
        return callback('Only the leader can propose');
      }
    } else {
      return callback('Game is not in the choosing phase');
    }
    return callback(null, changes);
  }
  
  vote(id, data, callback = () => {}) {
    if (this.state && this.state.phase === 'voting') {
      this.state.votes.remove({id});
      this.state.votes.add({id, vote: data.vote});
      // DEBUG TEST ONLY BEGIN
      for (const player of this.state.players.people) {
        this.state.votes.add({id: player.id, vote: false});
      }
      // DEBUG TEST ONLY END
      if (this.state.votes.length === this.state.players.length) {
        this.state.phase = 'tally';
      }
      const changes = {
        state: {
          votes: this.state.votes.toJSON().map(vote => {return vote.id})
        }
      };
      callback(null, changes);
      if (this.state.phase === 'tally') {
        this.tally(callback);
      }
    } else {
      return callback('Game is not in the voting phase');
    }
  }
  
  tally(callback = () => {}) {
    const currentMission = this.state.missions[this.state.missions.length - 1];
    const votes = {};
    for (const voter of this.state.votes.toJSON()) {
      votes[voter.id] = voter.vote;
    }
    currentMission.history.push({team: this.state.team.people, votes});
    
    const approvals = [];
    const rejections = [];
    for (const voter of this.state.votes.toJSON()) {
      if (voter.vote) {
        approvals.push(voter);
      } else {
        rejections.push(voter);
      }
    }
    
    this.state.votes.clear();
    
    const changes = {};
    if (approvals.length > rejections.length) {
      this.state.phase = 'mission';
      changes.state = {
        phase: this.state.phase
      };
    } else {
      this.state.phase = 'choosing';
      this.state.team.clear();
      changes.state = {
        phase: this.state.phase,
        missions: this.state.missions,
        team: this.state.team.toJSON(),
        votes: this.state.votes.toJSON()
      };
    }
    return callback(null, changes);
  }
  
  connected(id, connected, callback = () => {}) {
    let changes = null;
    if (this.state) {
      const player = this.state.players.get({id});
      if (player) {
        player.connected = connected;
        changes = {
          state: {
            players: this.state.players.toJSON()
          }
        };
      }
    }
    return callback(null, changes);
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