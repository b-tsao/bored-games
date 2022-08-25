import io from 'socket.io';
import log4js from 'log4js';
import cookie from 'cookie';
import { asyncChangeListener, compressChanges } from '../core/lib/ImmerPlugin';
import RoomManager from '../core/RoomManager';
import BGIOWrapper from '../core/BGIOWrapper';

const logger = log4js.getLogger('IORoomServer');

export default class IORoomServer {
  ioServer: io.Server;
  ioRoomServer: io.Namespace;

  constructor(ioServer: io.Server) {
    this.ioServer = ioServer;

    this.ioRoomServer = this.ioServer.of('/room');
    this.ioRoomServer.on('connection', (client) => {
      this.initializeClient(client);

      this.attachJoinListener(client);
      this.attachLeaveListener(client);
      this.attachConnectListener(client);
      this.attachDisconnectListener(client);
      this.attachHostActionListener(client);
      this.attachSettingsListener(client);
      this.attachGameListener(client);
      this.attachChatListener(client);
      this.attachBgioListener(client);
    });
  }

  initializeClient(client) {
    if (client.handshake.headers.cookie) {
      const cookies = cookie.parse(client.handshake.headers.cookie);
      if (cookies.userId) {
        client.userId = cookies.userId;
      } else {
        client.userId = client.id;
      }
    } else {
      client.userId = client.id;
    }
  }

  attachJoinListener(client) {
    client.on('joinSpectate', () => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting to join spectate in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to join room (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }
      room.addSpectator({ id: client.userId, client: client.id }, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
          client.disconnect();
        } else {
          client.join(`${key}#spectators`);
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
        }
      });
    });

    client.on('joinGame', (name) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting to join game in room (${key}) as name (${name})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to join game (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }
      room.addPlayer({ id: client.userId, client: client.id }, name, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          client.leave(`${key}#spectators`);
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
        }
      });
    });
  }

  attachLeaveListener(client) {
    client.on('leave', () => {
      client.disconnect();

      const key = client.roomKey;
      logger.trace(`User (${client.userId}) leaving room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room != null) {
        room.remove(client.userId, (err, ctxChanges) => {
          if (room.occupants === 0) {
            logger.trace(`Deleting room (${key}): Room empty`);
            RoomManager.deleteRoom(key);
          } else if (!err) {
            this.ioRoomServer.to(key).emit('changes', ctxChanges);
          }
        });
      }
    });
  }

  attachConnectListener(client) {
    client.on('connected', (key) => {
      logger.trace(`User (${client.userId}) requesting connect with client (${client.id}) to room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) connect with client (${client.id}) to room (${key}) failed: Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        client.disconnect();
        return;
      }
      room.connect(client.userId, client.id, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
          client.disconnect();
          return;
        } else if (room.spectators.hasOwnProperty(client.userId)) {
          // Is there a better way/place to do this?
          client.join(`${key}#spectators`);
          // END HACK
        }
        const cookieOptions = { path: '/', sameSite: true };
        client.emit('setCookie', cookie.serialize('userId', client.userId, cookieOptions));
        client.join(key);
        client.roomKey = key;
        RoomManager.clearRoomTimer(key);
        const [filteredState]: any = room.getState(client.userId);
        client.emit('room', room.getContext(), filteredState);
        client.to(key).emit('changes', ctxChanges);
      });
    });
  }

  attachDisconnectListener(client) {
    client.on('disconnect', (reason) => {
      const key = client.roomKey;
      const room = RoomManager.getRoom(key);
      if (room != null) {
        logger.trace(`Disconnecting user (${client.userId}) with client (${client.id}) from room (${client.roomKey}): ${reason}`);
        room.disconnect(client.userId, client.id, (err, ctxChanges) => {
          if (room.occupants === 0) {
            RoomManager.roomTimer(key);
          } else if (!err) {
            this.ioRoomServer.to(key).emit('changes', ctxChanges);
          }
        });
      }
    });
  }

  attachHostActionListener(client) {
    client.on('hostAction', (action, id, data) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting host action (${action}) against user (${id}) in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to do host action (${action}) against user (${id}) in room (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }
      room.hostAction(action, client.userId, id, data, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
        }
      });
    });
  }

  attachSettingsListener(client) {
    client.on('settings', (settings) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting settings change in room (${key}): ${JSON.stringify(settings)}`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) change settings in room (${key}) failed: Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }
      room.changeSettings(client.userId, settings, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
        }
      });
    });
  }

  attachGameListener(client) {
    client.on('start', () => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting start game in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) start game in room (${key}) failed: Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        client.disconnect();
        return;
      }
      room.startGame(client.userId, (err, ctxChanges, stateChanges, prevState) => {
        if (err) {
          logger.error(`User (${client.userId}) start game in room (${key}) failed: ${err}`);
          client.emit('message', { status: 'error', text: err });
        } else {
          for (const id in room.players) {
            const player = room.players[id];
            if (player.client.status === 'connected') {
              const [filteredState, filterChanges]: any = room.getState(id);
              const [finalState, finalChanges]: any = compressChanges(prevState, stateChanges.concat(filterChanges));
              this.ioRoomServer.to(player.client.id).emit('changes', ctxChanges, finalChanges);
            }
          }
          const [filteredState, filterChanges]: any = room.getState();
          const [finalState, finalChanges]: any = compressChanges(prevState, stateChanges.concat(filterChanges));
          this.ioRoomServer.to(`${room.key}#spectators`).emit('changes', ctxChanges, finalChanges);
        }
      });
    });

    client.on('end', () => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting end game in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) end game in room (${key}) failed: Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        client.disconnect();
        return;
      }
      room.endGame(client.userId, (err, ctxChanges, stateChanges, prevState) => {
        if (err) {
          logger.error(`User (${client.userId}) end game in room (${key}) failed: ${err}`);
          client.emit('message', { status: 'error', text: err });
        } else {
          for (const id in room.players) {
            const player = room.players[id];
            if (player.client.status === 'connected') {
              const [filteredState, filterChanges]: any = room.getState(id);
              const [finalState, finalChanges]: any = compressChanges(prevState, stateChanges.concat(filterChanges));
              this.ioRoomServer.to(player.client.id).emit('changes', ctxChanges, finalChanges);
            }
          }
          const [filteredState, filterChanges]: any = room.getState();
          const [finalState, finalChanges]: any = compressChanges(prevState, stateChanges.concat(filterChanges));
          this.ioRoomServer.to(`${room.key}#spectators`).emit('changes', ctxChanges, finalChanges);
        }
      });
    });
  }

  // attachGameListener(client) {
  //   client.on('game', (action, data) => {
  //     const key = client.roomKey;
  //     logger.trace(`User (${client.userId}) requesting game action (${action}) in room (${key}): ${JSON.stringify(data)}`);
  //     const room = RoomManager.getRoom(key);
  //     if (room == null) {
  //       logger.error(`User (${client.userId}) game action (${action}) in room (${key}) failed: Room does not exist`);
  //       client.emit('message', { status: 'error', text: 'Room does not exist' });
  //       client.disconnect();
  //       return;
  //     }
  //     room.gameAction(client.userId, action, data, (err, changes, options) => {
  //       if (err) {
  //         client.emit('message', { status: 'error', text: err });
  //       }
  //       this.broadcastChanges(room, changes, options);
  //     });
  //   });
  // }

  attachChatListener(client) {
    client.on('chat', (message, messageID?) => {
      const key = client.roomKey;
      if (messageID == null) {
        logger.trace(`User (${client.userId}) sending chat in room (${key}): ${JSON.stringify(message)}`);
      } else {
        logger.trace(`User (${client.userId}) modifying chat (${messageID}) in room (${key}): ${JSON.stringify(message)}`);
      }
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) chatting in room (${key}) failed: Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }
      room.editChat(client.userId, messageID, message, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
        }
      });
    });
  }

  attachBgioListener(client) {
    client.on('bgioHostAction', (action, id, data, cb = () => {}) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting bgio host action (${action}) against user (${id}) in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to do bgio host action (${action}) against user (${id}) in room (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }

      const state = room.game.state;
      if (!state.players) {
        logger.error(`User (${client.userId}) failed to do bgio host action (${action}) against user (${id}) in room (${key}): Player does not exist`);
        client.emit('message', { status: 'error', text: 'Player does not exist' });
        return;
      }

      let cid: any = null;
      for (const pid in state.players) {
        const player = state.players[pid];
        if (player.id === id) {
          cid = pid;
        }
      }

      if (!cid) {
        logger.error(`User (${client.userId}) failed to do bgio host action (${action}) against user (${id}) in room (${key}): Player does not exist`);
        client.emit('message', { status: 'error', text: 'Player does not exist' });
        return;
      }

      room.hostAction(action, client.userId, cid, data, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          this.ioRoomServer.to(key).emit('changes', ctxChanges);
          cb();
        }
      });
    });

    client.on('bgioTimer', () => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting bgio game timer in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to request bgio game timer in room (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }

      const game = room.game as BGIOWrapper;

      if (game.hasTimer()) {
        game.setTimer(null);
        logger.info(`User (${client.userId}) cleared bgio game timer in room (${key})`);
        this.ioRoomServer.to(key).emit('bgioTimer', null);
      } else {
        let counter = 0;
        game.setTimer(() => {
          this.ioRoomServer.to(key).emit('bgioTimer', counter);
          counter++;
        });
        logger.info(`User (${client.userId}) started bgio game timer in room (${key})`);
      }
    });

    client.on('bgioChangePlayer', (id) => {
      const key = client.roomKey;
      logger.trace(`User (${client.userId}) requesting bgio change player on user player id (${id}) in room (${key})`);
      const room = RoomManager.getRoom(key);
      if (room == null) {
        logger.error(`User (${client.userId}) failed to do bgio change player on user player id (${id}) in room (${key}): Room does not exist`);
        client.emit('message', { status: 'error', text: 'Room does not exist' });
        return client.disconnect();
      }

      if (Object.prototype.hasOwnProperty.call(room.players, client.userId)) {
        logger.error(`User (${client.userId}) failed to do bgio change player on user player id (${id}) in room (${key}): Already a player`);
        client.emit('message', { status: 'error', text: 'Already a player' });
        return;
      }

      const state = room.game.state;
      if (!state.players) {
        logger.error(`User (${client.userId}) failed to do bgio change player on user player id (${id}) in room (${key}): Player does not exist`);
        client.emit('message', { status: 'error', text: 'Player does not exist' });
        return;
      }

      let cid: any = null;
      for (const pid in state.players) {
        const player = state.players[pid];
        if (player.id === id) {
          cid = pid;
        }
      }
      if (!cid || !Object.prototype.hasOwnProperty.call(room.players, cid)) {
        logger.error(`User (${client.userId}) failed to do bgio change player on user player id (${id}) in room (${key}): Player does not exist`);
        client.emit('message', { status: 'error', text: 'Player does not exist' });
        return;
      }

      const player = room.players[cid];

      if (player.client.connected) {
        logger.error(`User (${client.userId}) failed to do bgio change player on user player id (${id}) in room (${key}): Player is connected`);
        client.emit('message', { status: 'error', text: 'Player is connected' });
        return;
      }

      room.contextChangeListener(ctx => {
        // room player swap
        delete ctx.spectators[client.userId];
        ctx.players[client.userId] = {
          ...player,
          client: {
            id: client.id,
            status: 'connected'
          }
        };
        delete ctx.players[cid];
      }, (err, ctxChanges) => {
        if (err) {
          client.emit('message', { status: 'error', text: err });
        } else {
          client.leave(`${key}#spectators`);

          asyncChangeListener(state, async state => {
            // game player swap
            state.players[client.userId] = state.players[cid];
            delete state.players[cid];
          }).then(([nextState, stateChanges]) => {
            // save state back to room game
            room.game.state = nextState;
            // broadcast changes
            this.ioRoomServer.to(key).emit('changes', ctxChanges, stateChanges);
            // send setCookie for reload on client
            const cookieOptions = { path: '/', sameSite: true };
            client.emit('setCookie', cookie.serialize('userId', client.userId, cookieOptions));
            logger.info(`User (${client.userId}) bgio changed player on user player id (${id}) in room (${key})`);
          });
        }
      });
    });
  }
}