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
        votes: this.state.votes.toJSON().map(voter => {return voter.id}), // hide the actual vote
        quest: this.state.quest.toJSON().map(chosen => {return chosen.id}),
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
      case 'quest':
        return this.quest(id, data, cb);
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
      leader: Math.floor(Math.random() * (data.players.length)), // idx of players
      team: new PeopleManager(), // [<player.name>]
      votes: new PeopleManager(comparator), // [{<player.id>: <Boolean>}]
      quest: new PeopleManager(comparator), // [<player.id>]
      quests: [{history: []}] // [{outcome: {success: <Boolean>, decisions: [<Boolean>]}, history: [{team: [<player.name>], votes: {<player.name>: <Boolean>}]}]
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
      const currentQuest = selectedBoard.quests[this.state.quests.length - 1];
      if (id === leader.id) {
        if (this.state.team.remove(data.id) ||
           (this.state.team.length < currentQuest.team && this.state.team.add(data.id))) {
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
        this.state.message = ''; // TEST DEBUG ONLY
        changes = {
          state: {
            phase: this.state.phase,
            message: this.state.message // // TEST DEBUG ONLY
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
      if (this.state.players.contains({id})) {
       this.state.votes.remove({id});
        this.state.votes.add({id, vote: data.vote});
        // DEBUG TEST ONLY BEGIN
        for (const player of this.state.players.people) {
          if (player.id.includes('id')) {
            this.state.votes.add({id: player.id, vote: data.vote});
          }
        }
        // DEBUG TEST ONLY END
        const changes = {state: {}};
        if (this.state.votes.length === this.state.players.length) {
          this.state.phase = 'tally';
          changes.state.phase = this.state.phase;
        }
        changes.state.votes = this.state.votes.toJSON().map(voter => {return voter.id});
        callback(null, changes);
        if (this.state.phase === 'tally') {
          this.tally(callback);
        } 
      } else {
        return callback('Not a player');
      }
    } else {
      return callback('Game is not in the voting phase');
    }
  }
  
  tally(callback = () => {}) {
    const changes = {state: {}};
    
    const currentQuest = this.state.quests[this.state.quests.length - 1];
    const votes = {};
    let approvals = 0;
    let rejections = 0;
    for (const voter of this.state.votes.toJSON()) {
      votes[voter.id] = voter.vote;
      if (voter.vote) {
        approvals++;
      } else {
        rejections++;
      }
    }
    currentQuest.history.push({team: this.state.team.people, votes});
    changes.state.quests = this.state.quests;
    
    this.state.votes.clear();
    changes.state.votes = this.state.votes.toJSON();
    
    if (approvals > rejections) {
      this.state.phase = 'questing';
    } else {
      if (currentQuest.history.length >= 5) {
        this.state.phase = 'end';
      } else {
        this.state.phase = 'choosing';
        this.state.team.clear();
        changes.state.team = this.state.team.toJSON();
      }
    }
    changes.state.phase = this.state.phase;
    
    return callback(null, changes);
  }
  
  quest(id, data, callback = () => {}) {
    if (this.state && this.state.phase === 'questing') {
      if (this.secrets[id]) {
        if (this.secrets[id][id].card.side === 'good' && data.decision === false) {
          return callback('Stop trolling, good can not fail the mission');
        } else {
          this.state.quest.remove({id});
          this.state.quest.add({id, decision: data.decision});
          // DEBUG TEST ONLY BEGIN
          for (const id of this.state.team.people) {
            if (id.includes('id')) {
              this.state.quest.add({id, decision: true});
            }
          }
          // DEBUG TEST ONLY END
          const changes = {state: {}};
          if (this.state.quest.length === this.state.team.length) {
            this.state.phase = 'result';
            changes.state.phase = this.state.phase;
          }
          changes.state.quest = this.state.quest.toJSON().map(chosen => {return chosen.id});
          callback(null, changes);
          if (this.state.phase === 'result') {
            this.result(callback);
          }
        }
      } else {
        return callback('Not a player');
      }
    } else {
      return callback('Game is not in the voting phase');
    }
  }
  
  result(callback = () => {}) {
    const changes = {state: {}};
    
    // Check if quest failed overall
    const selectedBoard = this.settings.boards[this.settings.selectedBoard];
    const quest = selectedBoard.quests[this.state.quests.length - 1];
    let fails = 0;
    let success = true;
    for (const q of this.state.quest.toJSON()) {
      if (!q.decision) {
        fails++;
        if (fails >= quest.fails) {
          success = false;
          break;
        }
      }
    }
    const currentQuest = this.state.quests[this.state.quests.length - 1];
    currentQuest.outcome = {success, decisions: this.state.quest.toJSON().map(chosen => {return chosen.decision})};
    
    // TEST DEBUG ONLY BEGIN
    this.state.message = `Decisions: ${currentQuest.outcome.decisions}`;
    changes.state.message = this.state.message;
    // TEST DEBUG ONLY END
    
    this.state.quest.clear();
    changes.state.quest = this.state.quest.toJSON();
    
    // Determine if the game ended
    let succeed = 0;
    let failed = 0;
    for (const q of this.state.quests) {
      if (q.outcome.success) {
        succeed++;
      } else {
        failed++;
      }
    }
    if (succeed >= 3) {
      this.state.phase = 'assassinating';
    } else if (failed >= 3) {
      this.state.phase = 'end';
    } else {
      this.state.phase = 'choosing';
      this.state.quests.push({history: []});
    }
    changes.state.quests = this.state.quests;
    changes.state.phase = this.state.phase;
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