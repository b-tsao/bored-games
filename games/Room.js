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
  
  addSpectator(id, callback = () => {}) {
    this.logger.trace(`Adding client (${id})`);
    
    if (this.spectators.contains(id)) {
      const reason = "Already in the room";
      this.logger.error(`Failed to add client (${id}): ${reason}`);
      return callback(reason);
    }
    
    const changes = {};
    
    // Just in case client was a player
    const player = this.players.remove({id});
    if (player) {
      if (player.host && this.players.length > 0) {
        this.players.people[0].host = true;
      }
      changes.players = this.players.toJSON();
    }
    
    this.spectators.add(id);
    changes.spectators = this.spectators.toJSON();
    this.logger.info(`Added client (${id})`);
    return callback(null, changes);
  }
  
  addPlayer(id, name, callback = () => {}) {
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
      return callback(reason);
    }
    
    const host = this.players.length === 0;
    
    const changes = {};
    
    if (this.spectators.remove(id)) {
      changes.spectators = this.spectators.toJSON();
    }
    this.players.add({id, name, host});
    changes.players = this.players.toJSON();
    this.logger.info(`Client (${id}) joined game as name (${name})`);
    return callback(null, changes);
  }
  
  remove(id, callback = () => {}) {
    this.logger.trace(`Removing client (${id})`);
    const changes = {};
    if (this.spectators.remove(id)) {
      changes.spectators = this.spectators.toJSON();
    } else {
      const player = this.players.remove({id});
      if (player) {
        if (player.host && this.players.length > 0) {
          this.players.people[0].host = true;
        }
        changes.players = this.players.toJSON();
      } else {
        const reason = "Client not in room";
        this.logger.error(`Failed to remove client (${id}): ${reason}`);
        return callback(reason);
      }
    }
    
    this.logger.info(`Removed client (${id})`);
    return callback(null, changes);
  }
  
  hostAction(action, sourceId, targetId, callback = () => {}) {
    this.logger.trace(`Client (${sourceId}) host action (${action}) against client (${targetId}))`);
    const source = this.players.get({id: sourceId});
    const target = this.players.get({id: targetId});
    
    const changes = {};
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
            changes.players = this.players.toJSON();
            break;
          case 'kick':
            this.players.remove(target);
            this.spectators.add(target.id);
            changes.players = this.players.toJSON();
            changes.spectators = this.spectators.toJSON();
            break;
          default:
            reason = "Invalid host action";
        }
      }
    }
    
    if (reason) {
      this.logger.error(`Client (${sourceId}) host action (${action}) against client (${targetId}) failed: ${reason}`);
      return callback(reason);
    } else {
      this.logger.info(`Client (${sourceId}) host action (${action}) against client (${targetId}) completed`);
      return callback(null, changes);
    }
  }
  
  gameAction(id, action, data, callback = () => {}) {
    this.logger.trace(`Client (${id}) game action (${action})`);
    const player = this.players.get({id});
    let reason;
    if (player == null || !player.host) {
      reason = "Host only action";
      this.logger.error(`Client (${id}) game action (${action}) failed: ${reason}`);
      return callback(reason);
    } else {
      if (action === 'start') {
        if (!data) {
          data = {};
        }
        data.players = this.players.toJSON();
        data.spectators = this.spectators.toJSON();
      }
      this.game.action(action, data, (err, changes, secrets) => {
        if (err) {
          this.logger.error(`Client (${id}) game action (${action}) failed: ${err}`);
          return callback(err);
        } else {
          this.logger.info(`Client (${id}) game action (${action}) completed`);
          return callback(null, {game: changes}, secrets);
        }
      });
    }
  }
  
  changeSettings(id, settings, callback = () => {}) {
    this.logger.trace(`Client (${id}) change settings (${JSON.stringify(settings)})`);
    const player = this.players.get({id});
    if (player == null || !player.host) {
      const reason = "Host only action";
      this.logger.error(`Client (${id}) change settings failed: ${reason}`);
      return callback(reason);
    } else {
      this.game.changeSettings(settings, (err, changes) => {
        if (err) {
          this.logger.error(`Client (${id}) change settings failed: ${err}`);
          return callback(err);
        } else {
          this.logger.info(`Client (${id}) change settings (${JSON.stringify(settings)}) completed`);
          return callback(null, {game: changes});
        }
      });
    }
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
}

module.exports = Room;