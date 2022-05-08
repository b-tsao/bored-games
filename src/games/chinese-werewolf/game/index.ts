import Cards, { Side } from './cards';
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
import Player from './player';

export const ChineseWerewolf = {
    name: 'chinese-werewolf',

    setup: (ctx, setupData) => {
        if (setupData) {
            const { cards, extra } = setupData;

            let shuffledCards = cards;
            let discarded = [];

            if (extra.randomThreeDivine) {
                let divine = cards.filter((card) => Cards[card].side === Side.Town && Cards[card].divine);
                const citizens = cards.filter((card) => Cards[card].side === Side.Town && !Cards[card].divine);
                const wolves = cards.filter((card) => Cards[card].side === Side.Wolves);
                const neutral = cards.filter((card) => Cards[card].side === Side.Neutral);

                for (let i = 0; i < 3; i++) {
                    divine = ctx.random.Shuffle(divine);
                }

                shuffledCards = [...divine.slice(0, 3), ...citizens, ...wolves, ...neutral];
                discarded = divine.slice(3);
            }

            for (let i = 0; i < 3; i++) {
                shuffledCards = ctx.random.Shuffle(shuffledCards);
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
                discards: [...shuffledCards.slice(i), ...discarded],
                state: 0,
                election: [],
                badge: null,
                reveal: false,
                log: [
                    {name: '系统', message: '欢迎来到狼人杀！', userID: '0'},
                    {name: '系统', message: '请等待上帝开始游戏。', userID: '0'}
                ],
                spectatorsSeeIdentity: extra.spectatorsSeeIdentity,
                deadSeeIdentity: extra.deadSeeIdentity
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
                discards: [Cards.citizen.id, Cards.alphawolf.id, Cards.bandit.id],
                state: 0,
                election: [],
                badge: null,
                reveal: false,
                log: [
                    {name: '系统', message: '欢迎来到狼人杀！', userID: '0'},
                    {name: '系统', message: '请等待上帝开始游戏。', userID: '0'}
                ],
                spectatorsSeeIdentity: true,
                deadSeeIdentity: true
            }
        }
    },

    playerView: (G, ctx, playerID) => {
        const players = {};
        for (const pid in G.players) {
            if (!playerID) {
                // spectator
                if (G.spectatorsSeeIdentity) {
                    players[pid] = G.players[pid];
                } else {
                    const { vote, ...others } = G.players[pid];
                    players[pid] = {
                        ...others,
                        roles: [],
                        lover: false,
                        vote: G.reveal ? vote : ''
                    }
                }
            } else if (playerID === String(G.god)) {
                // what god sees
                players[pid] = G.players[pid];
            } else if (pid === playerID) {
                // what player sees for themselves
                if (ctx.phase === 'setup') {
                    players[pid] = {
                        ...G.players[pid],
                        roles: []
                    }
                } else {
                    players[pid] = G.players[pid];
                }
            } else {
                if (!G.players[playerID].alive && G.deadSeeIdentity) {
                    players[pid] = G.players[pid];
                } else {
                    // what player sees of other players
                    const { lover, vote, ...others } = G.players[pid];
                    players[pid] = {
                        ...others,
                        roles: [],
                        lover: lover && (G.players[playerID].lover || G.players[playerID].roles.indexOf(Cards.cupid.id) >= 0),
                        vote: G.reveal ? vote : ''
                    };
                }
            }
        }

        const discards =
            (playerID === String(G.god) ||
            (playerID && G.players[playerID].roles.indexOf(Cards.bandit.id) >= 0 && ctx.phase !== 'setup')) ?
                G.discards :
                [];

        return {
            ...G,
            players,
            discards
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