'use strict';

const log4js = require('log4js');
const PeopleManager = require('./PeopleManager');

const Avalon = require('./avalon/Avalon');

class Room {
  constructor() {
    this.logger = log4js.getLogger("Room#undefined");

    this.spectators = new PeopleManager();
    this.players = new PeopleManager();
    this.game = null;
  }

  set key(key) {
    this.logger = log4js.getLogger(`Room#${key}`);
    this.id = key;
  }

  get key() {
    return this.id;
  }

  get occupants() {
    let playersLength = 0;
    for (const player of this.players) {
      if (player.client.status === 'connected') {
        playersLength++;
      }
    }
    return this.spectators.length + playersLength;
  }

  toJSON() {
    return {
      key: this.key,
      game: this.game.toJSON(),
      players: this.players.toArray(),
      spectators: this.spectators.toArray()
    };
  }

  setGame(gameId, callback = () => {}) {
    let err;
    switch (gameId) {
      case 'the-resistance-avalon':
        this.game = new Avalon();
        break;
      case 'shifty-eyed-spies':
        err = "Currently unavailable";
        break;
      default:
        err = "Game not supported";
        this.logger.error(`Failed to create game (${gameId}) room: ${err}`);
    }
    return callback(err);
  }

  contains(id, callback = () => {}) {
    const player = this.players.get(id);
    return (player && player.client.status === 'connected' || this.spectators.contains(id));
  }

  addSpectator(user, callback = () => {}) {
    const {id, client} = user;
    this.logger.trace(`Adding user (${id}) as spectator`);

    if (this.spectators.contains(id)) {
      const reason = "Already in the room";
      this.logger.error(`Failed to add user (${id}) as spectator: ${reason}`);
      return callback(reason);
    }

    const changes = {};

    // Just in case client was a player
    const player = this.players.remove(id);
    if (player) {
      if (player.host && this.players.length > 0) {
        const nextHost = this.findNextConnectedPlayer();
        if (nextHost) {
          nextHost.host = true;
        } else {
          // no available players to be host, kick them all
          this.players.clear();
        }
      }
      changes.players = this.players.toArray();
    }

    const spectator = {
      id,
      client: {
        id: client,
        status: 'connected'
      }
    };
    this.spectators.add(id, spectator);
    changes.spectators = this.spectators.toArray();
    this.logger.info(`Added user (${id}) as spectator`);
    return callback(null, changes);
  }

  addPlayer(user, name, callback = () => {}) {
    const {id, client} = user;
    this.logger.trace(`Client (${id}) joining game as name (${name})`);

    let reason;
    if (this.game.settings.hasOwnProperty('maxPlayers') && this.players.length >= this.game.settings.maxPlayers) {
      reason = "Room capacity exceeded";
    } else if (this.players.contains(id)) {
      reason = "Already in the game";
    } else {
      reason = this.checkName(name);
    }

    if (reason) {
      this.logger.error(`Client (${id}) failed to join game as name (${name}): ${reason}`);
      return callback(reason);
    }

    const changes = {};

    if (this.spectators.remove(id)) {
      changes.spectators = this.spectators.toArray();
    }
    const host = this.players.length === 0;
    const player = {
      id,
      client: {
        id: client,
        status: 'connected'
      },
      name,
      host
    };
    this.players.add(id, player);
    changes.players = this.players.toArray();
    this.logger.info(`Client (${id}) joined game as name (${name})`);
    return callback(null, changes);
  }

  remove(id, callback = () => {}) {
    this.logger.trace(`Removing client (${id})`);
    const changes = {};
    if (this.spectators.remove(id)) {
      changes.spectators = this.spectators.toArray();
    } else {
      const player = this.players.remove(id);
      if (player) {
        if (player.host && this.players.length > 0) {
          const nextHost = this.findNextConnectedPlayer();
          if (nextHost) {
            nextHost.host = true;
          } else {
            // no available players to be host, kick them all
            this.players.clear();
          }
        }
        changes.players = this.players.toArray();
        return callback(null, changes);
      } else {
        const reason = "Client not in room";
        this.logger.error(`Failed to remove client (${id}): ${reason}`);
        return callback(reason);
      }
    }

    this.logger.info(`Removed client (${id})`);
    return callback(null, changes);
  }
  
  connect(id, client, callback = () => {}) {
    this.logger.trace(`Connecting user (${id}) with client (${client})`);
    let err = null;
    let changes = null;
    const player = this.players.get(id);
    if (player) {
      if (player.client.status === 'connected' && player.client.id !== client) {
        err = `User (${id}) is already connected with client (${player.client.id})`;
      } else {
        player.client.status = 'connected';
        player.client.id = client;
        changes = {
          players: this.players.toArray()
        };
        if (this.game.state) {
          this.game.action(id, 'connect', client, (err, gameChanges, options) => {
            this.logger.info(`Connected user (${id}) to game (${this.game.title})`);
            if (gameChanges) {
              changes.game = gameChanges;
            }
            callback(null, changes, options);
          });
          return;
        }
      }
    } else {
      let spectator = this.spectators.get(id);
      if (spectator && spectator.client.id !== client) {
        err = `User (${id}) is already connected with client (${spectator.client.id})`;
      } else {
        spectator = {
          id,
          client: {
            id: client,
            status: 'connected'
          }
        };
        this.spectators.add(id, spectator);
        changes = {
          spectators: this.spectators.toArray()
        }
      }
    }
    if (err) {
      this.logger.error(`Connecting user (${id}) with client (${client}) failed: ${err}`);
    } else {
      this.logger.info(`Connected user (${id}) with client (${client})`);
    }
    return callback(err, changes);
  }

  disconnect(id, client, callback = () => {}) {
    this.logger.trace(`Disconnecting user (${id}) with client (${client})`);
    let changes = null;
    const player = this.players.get(id);
    if (player && player.client.id === client) {
      player.client.status = 'disconnected';
      player.client.id = null;
      if (player.host && !this.game.state) {
        player.host = false;
        const nextHost = this.findNextConnectedPlayer();
        if (nextHost) {
          nextHost.host = true;
        } else {
          // no available players to be host, kick them all
          this.players.clear();
        }
      }
      changes = {
        players: this.players.toArray()
      };
      if (this.game.state) {
        this.game.action(id, 'disconnect', null, (err, gameChanges, options) => {
          this.logger.info(`Disconnected user (${id}) with client (${client}) from game (${this.game.title})`);
          if (gameChanges) {
            changes.game = gameChanges;
          }
          callback(null, changes, options);
        });
        return;
      }
    } else {
      const spectator = this.spectators.get(id);
      if (spectator && spectator.client.id === client) {
        this.spectators.remove(id);
        changes = {
          spectators: this.spectators.toArray()
        };
      } else {
        this.logger.warn(`No user (${id}) is associated with client (${client})`)
      }
    }
    if (changes) {
      this.logger.info(`Disconnected user (${id}) with client (${client})`);
    }
    return callback(null, changes);
  }

  hostAction(action, sourceId, targetId, callback = () => {}) {
    this.logger.trace(`User (${sourceId}) host action (${action}) against user (${targetId}))`);
    const source = this.players.get(sourceId);
    const target = this.players.get(targetId);

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
            if (target.client.status === 'connected') {
              source.host = false;
              target.host = true;
              changes.players = this.players.toArray();
            } else {
              reason = "Unable to transfer host, target is not connected";
            }
            break;
          case 'kick':
            this.players.remove(targetId);
            changes.players = this.players.toArray();
            if (target.client.status === 'connected') {
              const spectator = {
                id: target.id,
                client: target.client
              };
              this.spectators.add(targetId, target);
              changes.spectators = this.spectators.toArray();
            }
            break;
          default:
            reason = "Invalid host action";
        }
      }
    }

    if (reason) {
      this.logger.error(`User (${sourceId}) host action (${action}) against user (${targetId}) failed: ${reason}`);
      return callback(reason);
    } else {
      this.logger.info(`User (${sourceId}) host action (${action}) against user (${targetId}) completed`);
      return callback(null, changes);
    }
  }

  gameAction(id, action, data, callback = () => {}) {
    this.logger.trace(`User (${id}) game action (${action})`);
    if (action === 'start') {
      const player = this.players.get(id);
      let reason;
      if (player == null || !player.host) {
        reason = "Host only action";
        this.logger.error(`User (${id}) game action (${action}) failed: ${reason}`);
        return callback(reason);
      }
      if (!data) {
        data = {};
      }
      data.players = this.players;
    }
    this.game.action(id, action, data, (err, changes, options) => {
      if (err) {
        this.logger.error(`User (${id}) game action (${action}) failed: ${err}`);
        return callback(err);
      } else {
        this.logger.info(`User (${id}) game action (${action}) completed`);
        return callback(null, {game: changes}, options);
      }
    });
  }

  changeSettings(id, settings, callback = () => {}) {
    this.logger.trace(`User (${id}) change settings (${JSON.stringify(settings)})`);
    const player = this.players.get(id);
    if (player == null || !player.host) {
      const reason = "Host only action";
      this.logger.error(`User (${id}) change settings failed: ${reason}`);
      return callback(reason);
    } else {
      this.game.changeSettings(settings, (err, changes) => {
        if (err) {
          this.logger.error(`User (${id}) change settings failed: ${err}`);
          return callback(err);
        } else {
          this.logger.info(`User (${id}) change settings (${JSON.stringify(settings)}) completed`);
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

    for (const player of this.players.toArray()) {
      if (player.name === name) {
        return "Name already exists";
      }
    }

    return null;
  }
  
  findNextConnectedPlayer() {
    for (const player of this.players) {
      if (player.client.status === 'connected') {
        return player;
      }
    }
  }
}

module.exports = Room;
