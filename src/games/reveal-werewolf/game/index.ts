import { ActivePlayers, Stage } from 'boardgame.io/core';
import {
    setSecret,
    wolf,
    vote,
    reveal
} from './moves';

export const RevealWerewolf = {
    name: 'reveal-werewolf',

    setup: (ctx, setupData) => {
        const players = ctx.playOrder.reduce((player, pid) => {
            player[pid] = {
                secret: '',
                alive: true,
                vote: '',
                know: []
            };
            return player;
        }, {});

        return {
            players,
            wolf: undefined,
            chat: [
                {name: '系统', message: '欢迎来到揭秘狼人杀！', userID: '0'},
                {name: '系统', message: '游戏规则如下：', userID: '0'},
                {name: '系统', message: '1. 玩家填写秘密', userID: '0'},
                {name: '系统', message: '2. 一位随机玩家成为🐺并公布秘密', userID: '0'},
                {name: '系统', message: '3. 白天玩家投票选择🐺', userID: '0'},
                {name: '系统', message: '4. 被投出去的玩家死亡并公布秘密', userID: '0'},
                {name: '系统', message: '5. 如🐺被投出去，下一位🐺将诞生，并白天继续投票', userID: '0'},
                {name: '系统', message: '6. 🐺每一晚揭晓一位玩家的秘密', userID: '0'},
                {name: '系统', message: '🐺获胜：成功揭晓其他活着玩家的秘密', userID: '0'},
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
            wolf: playerID === G.wolf ? G.wolf : undefined
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
                },
                activePlayers: { all: Stage.NULL }
            },
            onBegin: (G, ctx) => {
                for (const pid in G.players) {
                    const player = G.players[pid];
                    player.vote = '';
                }
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