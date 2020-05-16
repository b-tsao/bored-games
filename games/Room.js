'use strict';

const log4js = require('log4js');
const {changeListener} = require('./lib/Plugin');

const Game = require('./Game');
const Avalon = require('./avalon/Game');

class Room {
  constructor(gameId) {
    this.logger = log4js.getLogger("Room#undefined");

    this.spectators = {};
    this.players = {};
    
    switch (gameId) {
      case 'the-resistance-avalon':
        this.game = new Game(Avalon);
        break;
      case 'shifty-eyed-spies':
        throw new Error("Currently unavailable");
        break;
      default:
        throw new Error("Game not supported");
    }
  }

  set key(key) {
    this.logger = log4js.getLogger(`Room#${key}`);
    this.id = key;
  }

  get key() {
    return this.id;
  }

  get occupants() {
    let spectatorsLength = 0;
    for (const spectator in this.spectators) {
      if (this.spectators[spectator].client.status === 'connected') {
        spectatorsLength++;
      }
    }
    let playersLength = 0;
    for (const id in this.players) {
      if (this.players[id].client.status === 'connected') {
        playersLength++;
      }
    }
    return spectatorsLength + playersLength;
  }
  
  getContext() {
    return {
      key: this.key,
      players: this.players,
      spectators: this.spectators,
      ...this.game.ctx
    };
  }
  
  getState(playerId) {
    return this.game.serialize(this.getContext(), playerId);
  }
  
  contextChangeListener(fn, callback = () => {}) {
    const ctx = {
      spectators: this.spectators,
      players: this.players
    };
    
    const [err, nextCtx, changes] = changeListener(ctx, fn);
    
    if (err === undefined) {
      this.spectators = nextCtx.spectators;
      this.players = nextCtx.players;
      return callback(null, changes);
    } else {
      return callback(err);
    }
  }

  contains(id) {
    return (this.players.hasOwnProperty(id) && this.players[id].client.status === 'connected' || 
            this.spectators.hasOwnProperty(id) && this.spectators[id].client.status === 'connected');
  }
  
  /**
   * Check if the name is valid.
   *
   * @return err message if invalid, null if valid.
   */
  checkName(name) {
    if (name == null) {
      return "Invalid name";
    } else if (name.length > 20) {
      return "Name too long";
    }

    for (const id in this.players) {
      if (this.players[id].name === name) {
        return "Name already exists";
      }
    }

    return null;
  }
  
  findNextConnectedPlayer(players) {
    for (const id in players) {
      if (players[id].client.status === 'connected') {
        return id;
      }
    }
  }

  addSpectator(user, callback = () => {}) {
    const {id, client} = user;
    this.logger.trace(`Adding user (${id}) as spectator`);

    if (this.spectators.hasOwnProperty(id)) {
      const reason = "Already in the room";
      this.logger.error(`Failed to add user (${id}) as spectator: ${reason}`);
      return callback(reason);
    }
    
    this.contextChangeListener((ctx) => {
      // Just in case client was a player
      if (ctx.players.hasOwnProperty(id)) {
        const player = ctx.players[id];
        delete ctx.players[id];
        if (player.host && Object.keys(ctx.players).length > 0) {
          const nextHost = this.findNextConnectedPlayer(ctx.players);
          if (nextHost !== undefined) {
            ctx.players[nextHost].host = true;
          } else {
            // no available players to be host, kick them all
            ctx.players = {};
          }
        }
      }

      const spectator = {
        client: {
          id: client,
          status: 'connected'
        }
      };
      ctx.spectators[id] = spectator;
      
      this.logger.info(`Added user (${id}) as spectator`);
    }, callback);
  }

  addPlayer(user, name, callback = () => {}) {
    const {id, client} = user;
    this.logger.trace(`Client (${id}) joining game as name (${name})`);

    let reason;
    if (this.game.settings.hasOwnProperty('maxPlayers') && this.players.length >= this.game.settings.maxPlayers) {
      reason = "Room capacity exceeded";
    } else if (this.players.hasOwnProperty(id)) {
      reason = "Already in the game";
    } else {
      reason = this.checkName(name);
    }

    if (reason) {
      this.logger.error(`Client (${id}) failed to join game as name (${name}): ${reason}`);
      return callback(reason);
    }
    
    this.contextChangeListener((ctx) => {
      delete ctx.spectators[id];
      const host = Object.keys(ctx.players).length === 0;
      const player = {
        client: {
          id: client,
          status: 'connected'
        },
        name,
        host
      };
      ctx.players[id] = player;
      this.logger.info(`Client (${id}) joined game as name (${name})`);
    }, callback);
  }

  remove(id, callback = () => {}) {
    this.contextChangeListener((ctx) => {
      this.logger.trace(`Removing client (${id})`);
      
      if (ctx.spectators.hasOwnProperty(id)) {
        delete ctx.spectators[id];
      } else if (ctx.players.hasOwnProperty(id)) {
        const player = ctx.players[id];
        delete ctx.players[id];
        if (player.host && Object.keys(ctx.players).length > 0) {
          const nextHost = this.findNextConnectedPlayer(ctx.players);
          if (nextHost !== undefined) {
            ctx.players[nextHost].host = true;
          } else {
            // no available players to be host, kick them all
            ctx.players = {};
          }
        }
      } else {
        const err = "Client not in room";
        this.logger.warn(`Failed to remove client (${id}): ${err}`);
        return err;
      }
      this.logger.info(`Removed client (${id})`);
    }, callback);
  }
  
  connect(id, client, callback = () => {}) {
    this.contextChangeListener((ctx) => {
      this.logger.trace(`Connecting user (${id}) with client (${client})`);
      
      if (ctx.players.hasOwnProperty(id)) {
        const player = ctx.players[id];
        player.client.id = client;
        player.client.status = 'connected';
      } else if (ctx.spectators.hasOwnProperty(id)) {
        const spectator = ctx.spectators[id];
        spectator.client.id = client;
        spectator.client.status = 'connected';
      } else {
        const spectator = {
          client: {
            id: client,
            status: 'connected'
          }
        };
        ctx.spectators[id] = spectator;
      }
      this.logger.info(`Connected user (${id}) with client (${client})`);
    }, callback);
  }

  disconnect(id, client, callback = () => {}) {
    this.contextChangeListener((ctx) => {
      this.logger.trace(`Disconnecting user (${id}) with client (${client})`);
      
      if (ctx.players.hasOwnProperty(id)) {
        const player = ctx.players[id];
        if (player.client.id === client) {
          player.client.id = null;
          player.client.status = 'disconnected';
        }
      } else if (ctx.spectators.hasOwnProperty(id)) {
        const spectator = ctx.spectators[id];
        if (spectator.client.id === client) {
          delete ctx.spectators[id];
        }
      } else {
        const err = `No user (${id}) is associated with client (${client})`;
        this.logger.warn(err);
        return err;
      }
      this.logger.info(`Disconnected user (${id}) with client (${client})`);
    }, callback);
  }

  hostAction(action, sourceId, targetId, data, callback = () => {}) {
    this.contextChangeListener((ctx) => {
      this.logger.trace(`User (${sourceId}) host action (${action}) against user (${targetId}))`);
      
      const source = ctx.players[sourceId];
      const target = ctx.players[targetId];

      let reason;
      if (!ctx.players.hasOwnProperty(sourceId) || !source.host) {
        reason = "Host only action";
      } else {
        if (!ctx.players.hasOwnProperty(targetId)) {
          reason = "Target is not a player";
        } else {
          switch (action) {
            case 'transferHost':
              if (target.client.status === 'connected') {
                source.host = false;
                target.host = true;
              } else {
                reason = "Unable to transfer host, target is not connected";
              }
              break;
            case 'kick':
              delete ctx.players[targetId];
              if (target.client.status === 'connected') {
                const spectator = {
                  client: target.client
                };
                ctx.spectators[targetId] = spectator;
              }
              break;
            default:
              reason = "Invalid host action";
          }
        }
      }
      if (reason) {
        this.logger.error(`User (${sourceId}) host action (${action}) against user (${targetId}) failed: ${reason}`);
        return reason;
      } else {
        this.logger.info(`User (${sourceId}) host action (${action}) against user (${targetId}) completed`);
      }
    }, callback);
  }
  
  changeSettings(id, settings, callback = () => {}) {    
    this.logger.trace(`User (${id}) change settings (${JSON.stringify(settings)})`);
    const player = this.players[id];
    if (!this.players.hasOwnProperty(id) || !player.host) {
      const reason = "Host only action";
      this.logger.error(`User (${id}) change settings failed: ${reason}`);
      return callback(reason);
    } else {
      this.game.changeSettings(settings, (err, ctxChanges) => {
        if (err) {
          this.logger.error(`User (${id}) change settings failed: ${err}`);
        } else {
          this.logger.info(`User (${id}) change settings (${JSON.stringify(settings)}) completed`);
        }
        return callback(err, ctxChanges);
      });
    }
  }
  
  startGame(id, callback = () => {}) {
    this.logger.trace(`User (${id}) starting game`);
    const player = this.players[id];
    if (!this.players.hasOwnProperty(id) || !player.host) {
      const reason = "Host only action";
      this.logger.error(`User (${id}) start game failed: ${reason}`);
      return callback(reason);
    } else {
      // DEBUG TEST ONLY BEGIN
      const settings = this.getContext().settings;
      const selectedBoard = settings.selectedBoard;
      const board = settings.static.boards[selectedBoard];
      let i = Object.keys(this.players).length + 1;
      this.players = {...this.players};
      while (i <= board.minPlayers) {
        this.players['testbotid' + i] = {
          id: "testbotid" + i,
          client: {
            id: "testbotid" + i,
            status:'disconnected'
          },
          name: "TestBot" + i,
          host: false
        };
        i++;
      }
      // DEBUG TEST ONLY END
      this.game.start(this.getContext(), (err, ctxChanges, stateChanges, prevState) => {
        return callback(err, ctxChanges, stateChanges, prevState);
      });
    }
  }

  gameAction(id, action, data) {
    this.logger.trace(`User (${id}) game action (${action})`);
    if (action === 'start') {
      const player = this.players.get(id);
      let reason;
      if (player == null || !player.host) {
        reason = "Host only action";
        this.logger.error(`User (${id}) game action (${action}) failed: ${reason}`);
        return reason;
      }
      if (!data) {
        data = {};
      }
      data.players = this.players;
    }
    this.game.action(id, action, data, (err, changes, options) => {
      if (err) {
        this.logger.error(`User (${id}) game action (${action}) failed: ${err}`);
        return err;
      } else {
        this.logger.info(`User (${id}) game action (${action}) completed`);
      }
    });
  }
}

module.exports = Room;
