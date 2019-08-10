'use strict';

const log4js = require('log4js');
const PeopleManager = require('./PeopleManager');

const Avalon = require('./avalon/Avalon');

class Room {
  constructor(game) {
    this.logger = log4js.getLogger("Room#undefined");
    
    const comparator = (c1, c2) => {
      if (c1.id < c2.id) return -1;
      else if (c1.id > c2.id) return 1;
      else return 0;
    };
    
    this.game = this.initGame(game);
    this.spectators = new PeopleManager();
    this.players = new PeopleManager(comparator);
    this.changes = {};
  }
  
  set key(key) {
    this.logger = log4js.getLogger(`Room#${key}`);
    this.id = key;
  }
  
  get key() {
    return this.id;
  }
  
  get occupants() {
    return this.spectators.length + this.players.length;
  }
  
  toJSON() {
    return {
      key: this.key,
      game: this.game.toJSON(),
      players: this.players.toJSON(),
      spectators: this.spectators.toJSON()
    };
  }
  
  cleanChanges() {
    if (Object.keys(this.changes).length === 0) {
      return null;
    }
    const changes = this.changes;
    this.changes = {};
    return changes;
  }
  
  initGame(game) {
    switch (game) {
      case 'The Resistance: Avalon':
        return new Avalon();
        break;
      default:
        const err = new ReferenceError("Game not supported");
        this.logger.error(`Failed to create game (${game}) room: ${err.message}`);
        throw err;
    }
  }
  
  addSpectator(id) {
    this.logger.trace(`Adding client (${id})`);
    
    if (this.spectators.contains(id)) {
      const reason = "Already in the room";
      this.logger.error(`Failed to add client (${id}): ${reason}`);
      return reason;
    }
    
    // Just in case client was a player
    const player = this.players.remove({id});
    if (player) {
      if (player.host && this.players.length > 0) {
        this.players.people[0].host = true;
      }
      this.trackChange(['players']);
    }
    
    this.spectators.add(id);
    this.trackChange(['spectators']);
    this.logger.info(`Added client (${id})`);
    return null;
  }
  
  addPlayer(id, name) {
    this.logger.trace(`Client (${id}) joining game as name (${name})`);
    
    let reason;
    if (this.game.settings.hasOwnProperty('maxPlayers') && this.players.length >= this.game.settings.maxPlayers) {
      reason = "Room capacity exceeded";
    } else if (this.players.contains({id})) {
      reason = "Already in the game";
    } else {
      reason = this.checkName(name);
    }
    
    if (reason) {
      this.logger.error(`Client (${id}) failed to join game as name (${name}): ${reason}`);
      return reason;
    }
    
    const host = this.players.length === 0;
    
    if (this.spectators.remove(id)) {
      this.trackChange(['spectators']);
    }
    this.players.add({id, name, host});
    this.trackChange(['players']);
    this.logger.info(`Client (${id}) joined game as name (${name})`);
    return null;
  }
  
  remove(id) {
    this.logger.trace(`Removing client (${id})`);
    if (this.spectators.remove(id)) {
      this.trackChange(['spectators']);
    } else {
      const player = this.players.remove({id});
      if (player) {
        if (player.host && this.players.length > 0) {
          this.players.people[0].host = true;
        }
        this.trackChange(['players']);
      } else {
        this.logger.error(`Failed to remove client (${id}): Client not in room`);
        return false;
      }
    }
    
    this.logger.info(`Removed client (${id})`);
    return true;
  }
  
  hostAction(action, sourceId, targetId) {
    const source = this.players.get({id: sourceId});
    const target = this.players.get({id: targetId});
    let reason;
    if (source == null || !source.host) {
      reason = "Host only action";
    } else {
      if (target == null) {
        reason = "Target is not a player";
      } else {
        switch (action) {
          case 'transferHost':
            source.host = false;
            target.host = true;
            this.trackChange(['players']);
            break;
          case 'kick':
            this.players.remove(target);
            this.spectators.add(target.id);
            this.trackChange(['players']);
            this.trackChange(['spectators']);
            break;
          default:
            reason = "Invalid host action";
        }
      }
    }
    return reason;
  }
  
  gameAction(id, action, data) {
    const player = this.players.get({id});
    let reason;
    if (player == null || !player.host) {
      reason = "Host only action";
    } else {
      if (action === 'start') {
        if (!data) {
          data = {};
        }
        data.players = this.players.toJSON();
        data.spectators = this.spectators.toJSON();
      }
      reason = this.game.action(action, data);
      if (!reason) {
        this.trackChange(['game']);
      }
    }
    return reason;
  }
  
  getPlayerSecrets() {
    return this.game.getPlayerSecrets();
  }
  
  changeSettings(id, settings) {
    const player = this.players.get({id});
    let reason;
    if (player == null || !player.host) {
      reason = "Host only action";
    } else {
      reason = this.game.changeSettings(settings);
      if (!reason) {
        this.trackChange(['game']);
      }
    }
    return reason;
  }
  
  /**
   * Check if the name is valid.
   *
   * @return err message if invalid, null if valid.
   */
  checkName(name) {
    if (name == null) {
      return "Invalid name";
    }
    
    const comparator = (c1, c2) => {
      if (c1.name < c2.name) return -1;
      else if (c1.name > c2.name) return 1;
      else return 0;
    };
    
    if (this.players.contains({name}, comparator)) {
      return "Name already exists";
    }
    return null;
  }
  
  /**
   * Keep track of changes made to room to return so we don't have to return the whole object every time.
   * Ex: (room, ['settings'])
   */
  trackChange(path) {
    if (path == null || path.length === 0) {
      this.changes = this.state;
      return;
    }
    
    let i = 0;
    let assign = this;
    let changes = this.changes;
    let newField = null;
    let changesRef;
    while (i < path.length - 1) {
      if (!assign[path[i]]) {
        throw new RangeError('Path does not exist');
      } else {
        assign = assign[path[i]];
      }
      
      if (newField) {
        changes[path[i]] = {};
      } else if (changes[path[i]]) {
        changes = changes[path[i]];
      } else {
        newField = path[i];
        changesRef = changes;
        changes[path[i]] = {};
      }
      changes = changes[path[i]];
      i++;
    }
    
    changes[path[i]] = assign[path[i]].cleanChanges();
    if (!changes[path[i]]) {
      if (newField) {
        delete changesRef[newField];
      } else {
        delete changes[path[i]];
      }
    }
  }
}

module.exports = Room;