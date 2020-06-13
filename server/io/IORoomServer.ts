import io from 'socket.io';
import log4js from 'log4js';
import cookie from 'cookie';
import { compressChanges } from '../core/lib/ImmerPlugin';
import RoomManager from '../core/RoomManager';

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
      this.attachStartListener(client);
      // this.attachGameListener(client);
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

  attachStartListener(client) {
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
}