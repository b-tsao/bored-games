import { ActivePlayers, Stage } from 'boardgame.io/core';
import {
    setSecret,
    wolf,
    vote,
    reveal
} from './moves';
import Player from './player';

export const RevealWerewolf = {
    name: 'reveal-werewolf',

    setup: (ctx, setupData) => {
        const players = ctx.playOrder.reduce((player, pid) => {
            player[pid] = new Player();
            return player;
        }, {});

        return {
            players,
            wolf: undefined,
            chat: [
                {name: '系统', message: '欢迎来到揭秘狼人杀！', userID: '0'},
                {name: '系统', message: '请输入自己的秘密。', userID: '0'}
            ]
        };
    },

    playerView: (G, ctx, playerID) => {
        const players = {};
        for (const pid in G.players) {
            if (!playerID) {
                // spectator
                if (!G.players[pid].alive) {
                    players[pid] = G.players[pid];
                } else {
                    const { secret, vote, know, ...others } = G.players[pid];
                    players[pid] = {
                        ...others,
                        secret: secret !== '' ? '???' : '',
                        vote,
                        know: []
                    };
                }
            } else if (pid === playerID) {
                // self
                players[pid] = G.players[pid];
            } else {
                // others
                const { secret, vote, know, ...others } = G.players[pid];
                if (G.players[playerID].know.indexOf(pid) >= 0) {
                    players[pid] = {
                        ...others,
                        secret,
                        vote: vote !== '' ? '?' : '',
                        know: []
                    }
                } else {
                    players[pid] = {
                        ...others,
                        secret: secret !== '' ? '???' : '',
                        vote: vote !== '' ? '?' : '',
                        know: []
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