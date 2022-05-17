import { ActivePlayers, Stage } from 'boardgame.io/core';
import {
    setSecret,
    wolf,
    vote,
    reveal
} from './moves';
import Player from './player';

export const XPWerewolf = {
    name: 'xp-werewolf',

    setup: (ctx, setupData) => {
        const players = ctx.playOrder.reduce((player, pid) => {
            player[pid] = new Player();
            return player;
        }, {});

        return {
            players,
            wolf: undefined,
            pk: null,
            chat: [
                {name: '系统', message: '欢迎来到XP狼人杀！', userID: '0'},
                {name: '系统', message: '请输入自己的XP。', userID: '0'}
            ]
        };
    },

    playerView: (G, ctx, playerID) => {
        const players = {};
        for (const pid in G.players) {
            if (pid === playerID || !G.players[pid].alive) {
                players[pid] = G.players[pid];
            } else {
                const { secret, vote, ...others } = G.players[pid];
                if (!playerID) {
                    players[pid] = {
                        ...others,
                        secret: '',
                        vote
                    }
                } else {
                    players[pid] = {
                        ...others,
                        secret: '',
                        vote: ''
                    };
                }
            }
        }

        return {
            ...G,
            players,
            wolf: playerID === String(G.wolf) ? G.wolf : undefined
        }
    },

    phases: {
        setup: {
            endIf: (G, ctx) => Object.keys(G.players).filter((pid) => G.players[pid].secret !== '').length === ctx.numPlayers,
            onEnd: wolf,
            turn: {
                activePlayers: ActivePlayers.ALL_ONCE
            },
            moves: { setSecret },
            next: 'day',
            start: true
        },
        day: {
            turn: {
                order: {
                    first: (G, ctx) => G.wolf,
                    next: (G, ctx) => G.wolf
                }
            },
            onBegin: (G, ctx) => {
                for (const pid in G.players) {
                    const player = G.players[pid];
                    player.vote = '';
                }
                ctx.events.setActivePlayers({ all: Stage.NULL })
            },
            moves: { vote },
            next: 'night'
        },
        night: {
            turn: {
                order: {
                    first: (G, ctx) => G.wolf,
                    next: (G, ctx) => G.wolf
                },
            },
            onBegin: (G, ctx) => {
                for (const pid in G.players) {
                    const player = G.players[pid];
                    player.vote = '';
                }
            },
            moves: { reveal },
            next: 'day'
        }
    }
};