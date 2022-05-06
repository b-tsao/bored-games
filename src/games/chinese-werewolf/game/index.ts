import {
    setRole,
    setDiscard,
    start,
    transfer,
    kill,
    badge,
    lover,
    next,
    vote,
    reveal
} from './moves';
import Player, { toRole } from './player';

export const ChineseWerewolf = {
    name: 'chinese-werewolf',

    setup: (ctx, setupData) => {
        if (setupData) {
            const { cards, extra } = setupData;
            let shuffledCards = cards;
            for (let i = 0; i < 3; i++) {
                shuffledCards = ctx.random.Shuffle(cards);
            }

            const players = ctx.playOrder.reduce((player, pid) => {
                player[pid] = new Player()
                return player;
            }, {});

            // distribute out cards to players except god (host) until it runs out
            const pids = Object.keys(players);
            let roles = extra.doubleIdentity ? 2 : 1;
            let i = 0;
            for (let j = 0; j < roles; j++) {
                let k = 1;
                while (i < shuffledCards.length && k < pids.length) {
                    const player = players[pids[k]];
                    player.addRole(shuffledCards[i]);
                    i++;
                    k++;
                }
            }

            return {
                god: Number(ctx.currentPlayer),
                players,
                discards: shuffledCards.slice(i).map((card) => toRole(card)),
                state: 0,
                election: false,
                badge: null,
                reveal: false,
                log: [
                    {name: '系统', message: '欢迎来到狼人杀！', userID: '0'},
                    {name: '系统', message: '请等待上帝开始游戏。', userID: '0'}
                ]
            };
        } else {
            // development because BGIO is trash right now
            const players = ctx.playOrder.reduce((player, pid) => {
                player[pid] = new Player()
                return player;
            }, {});

            return {
                god: Number(ctx.currentPlayer),
                players,
                discards: [0, 1, 2, 3],
                state: 0,
                election: false,
                badge: null,
                reveal: false,
                log: [
                    {name: '系统', message: '欢迎来到狼人杀！', userID: '0'},
                    {name: '系统', message: '请等待上帝开始游戏。', userID: '0'}
                ]
            }
        }
    },

    playerView: (G, ctx, playerID) => {
        const players = {};
        for (const pid in G.players) {
            if (playerID === String(G.god)) {
                players[pid] = G.players[pid];
            } else if (pid === playerID) {
                if (ctx.phase === 'setup') {
                    players[pid] = {
                        ...G.players[pid],
                        roles: []
                    }
                } else {
                    players[pid] = G.players[pid];
                }
            } else {
                const { roles, lover, vote, ...others } = G.players[pid];
                players[pid] = {
                    roles: [],
                    lover: lover && G.players[playerID].lover,
                    vote: G.reveal ? vote : '',
                    ...others
                };
            }
        }

        return {
            ...G,
            players,
            discard: (ctx.phase === 'setup') ? [] : G.discard
        }
    },

    turn: {
        order: {
            first: (G, ctx) => G.god,
            next: (G, ctx) => G.god
        }
    },

    phases: {
        setup: {
            moves: { setRole, setDiscard, start },
            next: 'main',
            start: true
        },
        main: {
            turn: {
                order: {
                    first: (G, ctx) => G.god,
                    next: (G, ctx) => G.god,
                },
                onBegin: (G, ctx) => {
                    for (const pid in G.players) {
                        const player = G.players[pid];
                        player.vote = '';
                    }
                    ctx.events.setActivePlayers({ currentPlayer: 'god' })
                    G.state = 0;
                    G.reveal = false;
                },
                stages: {
                    god: {
                        moves: { setRole, setDiscard, transfer, kill, badge, lover, reveal, next }
                    },
                    vote: {
                        moves: { vote }
                    }
                }
            }
        }
    }
};