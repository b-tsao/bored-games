import log4js from 'log4js';
import { errorListener } from './lib/ImmerPlugin';

import Game from './Game';
// import Avalon from '../../src/games/avalon/Game';

import Cards, { Side } from '../games/chinese-werewolf/cards';

import BGIOWrapper from './BGIOWrapper';
import { People, Player, AnyFunction } from './types';

export default class Room {
  logger: log4js.Logger;
  id: string | undefined;
  spectators: People;
  players: People;
  chat: { userID: string, modified: boolean, message: string }[];
  game: Game | BGIOWrapper;

  constructor(props: any) {
    this.logger = log4js.getLogger('Room#undefined');
    this.id = undefined;

    this.spectators = {};
    this.players = {};
    this.chat = [];

    switch (props.id) {
      case 'the-resistance-avalon':
        throw new Error('Currently unavailable');
        // this.game = new Game(Avalon);
        break;
      case 'mahjong':
        this.game = new BGIOWrapper(props, { numPlayers: 4, setupData: {} });
        break;
      case 'chinese-werewolf':
        this.game = new BGIOWrapper(props, {
          numPlayers: 13,
          setupData: {
            cards: [],
            extra: {
              selectionTermsOnly: true,
              spectatorsSeeIdentity: false,
              deadSeeIdentity: true,
              randomThreeDivine: false,
              doubleIdentity: false,
              hiddenChanges: false,
            }
          },
          static: {
            presets: {
              '12 预女猎守 +4民 +3普狼 +1狼枪': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.guard.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.alphawolf.id
              ],
              '12 预女猎白 +4民 +4普狼': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.idiot.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id
              ],
              '12 预女猎 +守墓人 +4民 +3普狼 +1石像鬼': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.gravekeeper.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.gargoyle.id
              ],
              '12 预女猎 +骑士 +4民 +3普狼 +1白狼王': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.knight.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.whitewolf.id
              ],
              '14 盗丘 预女猎白守 +5民 +4普狼': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.idiot.id, Cards.guard.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id,
                Cards.bandit.id, Cards.cupid.id
              ],
              '10 奇迹商人': [
                Cards.prophet.id, Cards.witch.id, Cards.miracle_merchant.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.alphawolf.id
              ],
              '12 奇迹商人': [
                Cards.prophet.id, Cards.witch.id, Cards.guard.id, Cards.miracle_merchant.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.alphawolf.id
              ],
              '12 骑士狼美': [
                Cards.prophet.id, Cards.witch.id, Cards.guard.id, Cards.knight.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.beautywolf.id
              ],
              '10 时波之乱': [
                Cards.prophet.id, Cards.witch.id, Cards.light_scholar.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.night_mentor.id
              ],
              '12 时波之乱': [
                Cards.prophet.id, Cards.witch.id, Cards.guard.id, Cards.light_scholar.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.night_mentor.id
              ],
              '12 无目之夜': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.dreamer.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.hiddenwolf.id, Cards.gargoyle.id, Cards.crowwolf.id
              ],
              '12 迷雾雅影': [
                Cards.prophet.id, Cards.alchemist.id, Cards.idiot.id, Cards.dreamer.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.crowwolf.id
              ],
              '12 永序之轮': [
                Cards.prophet.id, Cards.witch.id, Cards.guard.id, Cards.prince.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.concubine_wolf.id
              ],
              '12 怪盗侦探': [
                Cards.investigator.id, Cards.dog.id, Cards.witch.id, Cards.hunter.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.phantomwolf.id
              ],
              '12 丘比特奇缘': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.idiot.id,
                Cards.dreamer.id, Cards.crow.id,
                Cards.cupid.id, Cards.hybrid.id,
                Cards.nightmare.id, Cards.concubine_wolf.id, Cards.alphawolf.id, Cards.witchwolf.id
              ],
              '12 帝尊魔皇-九天圣人': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.saint.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id, Cards.emperor.id
              ],
              '8 双身份': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.guard.id, Cards.idiot.id, Cards.crow.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.hiddenwolf.id, Cards.alphawolf.id, Cards.werewolf.id,
                Cards.bandit.id
              ],
              '9 五选三': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.guard.id, Cards.idiot.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id,
              ],
              '10 五选三': [
                Cards.prophet.id, Cards.witch.id, Cards.hunter.id, Cards.guard.id, Cards.idiot.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.werewolf.id, Cards.werewolf.id, Cards.werewolf.id,
                Cards.hybrid.id
              ],
              '10 究极五选三': [
                Cards.prophet.id, Cards.witch.id,Cards.reviver.id, Cards.stalker.id, Cards.ninetails.id,
                Cards.citizen.id, Cards.citizen.id, Cards.citizen.id,
                Cards.nightmare.id, Cards.alphawolf.id, Cards.bat.id,
                Cards.werewolf.id, Cards.werewolf.id,
                Cards.hybrid.id, Cards.avenger.id, Cards.fox.id
              ]
            },
            cards: {
              town: Object.values(Cards).filter((card) => card.side === Side.Town),
              wolves: Object.values(Cards).filter((card) => card.side === Side.Wolves),
              neutral: Object.values(Cards).filter((card) => card.side === Side.Neutral && card.id !== Cards.sheriff.id)
            },
            chat: {
              meow: {
                img: 'https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c'
              }
            },
            background: {
              setup: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/33b30445ff2f4217b4b85e7833f8b898.jpeg'
              },
              day: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/cc60468d651c4f82af7aeeb99ff83ef4.jpeg'
              },
              night: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/4a8dfbe3594848f89e240d0e2fdffd5f.jpeg'
              }
            }
          }
        });
        break;
      case 'reveal-werewolf':
        this.game = new BGIOWrapper(props, { numPlayers: 8, setupData: {
          static: {
            background: {
              setup: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/33b30445ff2f4217b4b85e7833f8b898.jpeg'
              },
              day: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/cc60468d651c4f82af7aeeb99ff83ef4.jpeg'
              },
              night: {
                img: 'https://5b0988e595225.cdn.sohucs.com/images/20180223/4a8dfbe3594848f89e240d0e2fdffd5f.jpeg'
              }
            }
          }
        } });
        break;
      default:
        throw new Error('Game not supported');
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
      chat: this.chat,
      ...this.game.ctx
    };
  }

  getState(playerId?: string) {
    return this.game.serialize(this.getContext(), playerId);
  }

  contextChangeListener(fn: AnyFunction, callback: AnyFunction) {
    const ctx = {
      spectators: this.spectators,
      players: this.players,
      chat: this.chat
    };

    const [err, nextCtx, changes] = errorListener(ctx, fn);

    if (err === undefined) {
      this.spectators = nextCtx.spectators;
      this.players = nextCtx.players;
      this.chat = nextCtx.chat;
      return callback(null, changes);
    } else {
      return callback(err);
    }
  }

  contains(id: string) {
    return (this.players.hasOwnProperty(id) && this.players[id].client.status === 'connected' ||
      this.spectators.hasOwnProperty(id) && this.spectators[id].client.status === 'connected');
  }

  /**
   * Check if the name is valid.
   *
   * @return err message if invalid, null if valid.
   */
  checkName(name: string) {
    if (name == null) {
      return 'Invalid name';
    } else if (name.length > 20) {
      return 'Name too long';
    }

    for (const id in this.players) {
      if (this.players[id].name === name) {
        return 'Name already exists';
      }
    }

    return null;
  }

  findNextConnectedPlayer(players: People) {
    for (const id in players) {
      if (players[id].client.status === 'connected') {
        return id;
      }
    }
  }

  addSpectator(user: { id: string, client: string }, callback: AnyFunction) {
    const { id, client } = user;
    this.logger.trace(`Adding user (${id}) as spectator`);

    if (this.spectators.hasOwnProperty(id)) {
      const reason = 'Already in the room';
      this.logger.error(`Failed to add user (${id}) as spectator: ${reason}`);
      return callback(reason);
    }

    this.contextChangeListener(ctx => {
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

  addPlayer(user: { id: string, client: string }, name: string, callback: AnyFunction) {
    const { id, client } = user;
    this.logger.trace(`Client (${id}) joining game as name (${name})`);

    let reason: string | null;
    if (this.game.context.inProgress) {
      reason = 'Game is currently in progress';
    } else if (this.game.settings.hasOwnProperty('maxPlayers') && Object.keys(this.players).length >= this.game.settings.numPlayers) {
      reason = 'Room capacity exceeded';
    } else if (this.players.hasOwnProperty(id)) {
      reason = 'Already in the game';
    } else {
      reason = this.checkName(name);
    }

    if (reason) {
      this.logger.error(`Client (${id}) failed to join game as name (${name}): ${reason}`);
      return callback(reason);
    }

    this.contextChangeListener(ctx => {
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

  remove(id: string, callback: AnyFunction) {
    this.contextChangeListener(ctx => {
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
            // No available players to be host, kick them all
            ctx.players = {};
          }
        }
      } else {
        const err = 'Client not in room';
        this.logger.warn(`Failed to remove client (${id}): ${err}`);
        return err;
      }
      this.logger.info(`Removed client (${id})`);
    }, callback);
  }

  connect(id: string, client: string, callback: AnyFunction) {
    this.contextChangeListener(ctx => {
      this.logger.trace(`Connecting user (${id}) with client (${client})`);

      if (ctx.players.hasOwnProperty(id)) {
        const player = ctx.players[id];
        player.client.id = client;
        player.client.status = 'connected';
        this.logger.debug(`Player (${id}) connected with client (${client})`);
      } else if (ctx.spectators.hasOwnProperty(id)) {
        const spectator = ctx.spectators[id];
        spectator.client.id = client;
        spectator.client.status = 'connected';
        this.logger.debug(`Spectator (${id}) connected with client (${client})`);
      } else {
        const spectator = {
          client: {
            id: client,
            status: 'connected'
          }
        };
        ctx.spectators[id] = spectator;
        this.logger.debug(`New spectator (${id}) connected with client (${client})`);
      }
      this.logger.info(`Connected user (${id}) with client (${client})`);
    }, callback);
  }

  disconnect(id: string, client: string, callback: AnyFunction) {
    this.contextChangeListener(ctx => {
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

  hostAction(action: string, sourceId: string, targetId: string, data: object, callback: AnyFunction) {
    this.contextChangeListener(ctx => {
      this.logger.trace(`User (${sourceId}) host action (${action}) against user (${targetId}))`);

      const source = ctx.players[sourceId];
      const target = ctx.players[targetId];

      let reason: string | undefined;
      if (!ctx.players.hasOwnProperty(sourceId) || !source.host) {
        reason = 'Host only action';
      } else {
        if (!ctx.players.hasOwnProperty(targetId)) {
          reason = 'Target is not a player';
        } else {
          switch (action) {
            case 'transferHost':
              if (target.client.status === 'connected') {
                source.host = false;
                target.host = true;
              } else {
                reason = 'Unable to transfer host, target is not connected';
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
              reason = 'Invalid host action';
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

  changeSettings(id: string, settings: object, callback: AnyFunction) {
    this.logger.trace(`User (${id}) change settings (${JSON.stringify(settings)})`);
    const player = this.players[id];
    if (!this.players.hasOwnProperty(id) || !player.host) {
      const reason = 'Host only action';
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

  startGame(id: string, callback: AnyFunction) {
    this.logger.trace(`User (${id}) starting game`);
    const player: Player = this.players[id];
    if (!this.players.hasOwnProperty(id) || !player.host) {
      const reason = 'Host only action';
      this.logger.error(`User (${id}) start game failed: ${reason}`);
      return callback(reason);
    } else {
      // DEBUG TEST ONLY BEGIN
      if (this.game.id === 'the-resistance-avalon') {
        const settings = this.getContext().settings;
        const selectedBoard = settings.selectedBoard;
        const board = settings.static.boards[selectedBoard];
        let i = Object.keys(this.players).length + 1;
        this.players = { ...this.players };
        while (i <= board.minPlayers) {
          this.players['testbotid' + i] = {
            client: {
              id: 'testbotid' + i,
              status: 'disconnected'
            },
            name: 'TestBot' + i,
            host: false
          };
          i++;
        }
      }
      // DEBUG TEST ONLY END
      this.game.start(this.getContext(), (err, ctxChanges, stateChanges, prevState) => {
        return callback(err, ctxChanges, stateChanges, prevState);
      });
    }
  }

  endGame(id: string, callback: AnyFunction) {
    this.logger.trace(`User (${id}) ending game`);
    const player: Player = this.players[id];
    if (!this.players.hasOwnProperty(id) || !player.host) {
      const reason = 'Host only action';
      this.logger.error(`User (${id}) end game failed: ${reason}`);
      return callback(reason);
    } else {
      this.game.end(this.getContext(), (err, ctxChanges, stateChanges, prevState) => {
        return callback(err, ctxChanges, stateChanges, prevState);
      });
    }
  }

  // gameAction(id, action, data) {
  //   this.logger.trace(`User (${id}) game action (${action})`);
  //   if (action === 'start') {
  //     const player = this.players.get(id);
  //     let reason;
  //     if (player == null || !player.host) {
  //       reason = 'Host only action';
  //       this.logger.error(`User (${id}) game action (${action}) failed: ${reason}`);
  //       return reason;
  //     }
  //     if (!data) {
  //       data = {};
  //     }
  //     data.players = this.players;
  //   }
  //   this.game.action(id, action, data, (err, changes, options) => {
  //     if (err) {
  //       this.logger.error(`User (${id}) game action (${action}) failed: ${err}`);
  //       return err;
  //     } else {
  //       this.logger.info(`User (${id}) game action (${action}) completed`);
  //     }
  //   });
  // }

  editChat(id: string, mid: number | undefined | null, message: string, callback: AnyFunction) {
    if (mid != null && (mid < 0 || mid >= this.chat.length || this.chat[mid].userID !== id)) {
      return callback('Invalid message to edit');
    }
    this.contextChangeListener(ctx => {
      if (mid == null) {
        ctx.chat.push({ userID: id, modified: false, message });
      } else {
        ctx.chat[mid] = { ...ctx.chat[mid], modified: true, message };
      }
    }, callback);
  }

  dispose() {
    this.game.dispose();
  }
}