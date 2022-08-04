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
    reveal,
    election,
    modifyChat,
    deleteChat,
    lockChat,
    freeChat,
    chat,
    read
} from './moves';

export const ChineseWerewolf = {
    name: 'chinese-werewolf',

    setup: (ctx, setupData) => {
        if (setupData === undefined) {
            // mock for testing
            setupData = {
                cards: [Cards.citizen.id, Cards.alphawolf.id, Cards.bandit.id],
                extra: {
                  selectionTermsOnly: true,
                  spectatorsSeeIdentity: false,
                  deadSeeIdentity: true,
                  randomThreeDivine: false,
                  doubleIdentity: false,
                  hiddenChanges: false
                }
            };
        }
        const { cards, extra } = setupData;

        let shuffledCards = cards;
        let discarded: string[] = [];

        if (extra.randomThreeDivine) {
            let divine = cards.filter((card) => Cards[card].side === Side.Town && Cards[card].divine);
            const citizens = cards.filter((card) => Cards[card].side === Side.Town && !Cards[card].divine);

            let otherWolves = cards.filter((card) => Cards[card].side === Side.Wolves && Cards[card].id !== Cards.werewolf.id);
            const normalWolves = cards.filter((card) => Cards[card].side === Side.Wolves && Cards[card].id === Cards.werewolf.id);

            let neutrals = cards.filter((card) => Cards[card].side === Side.Neutral);

            divine = ctx.random.Shuffle(divine);
            otherWolves = ctx.random.Shuffle(otherWolves);
            neutrals = ctx.random.Shuffle(neutrals);

            // grab 3 divines if possible
            const town = [...citizens, ...divine.slice(0, 3)];
            divine = divine.slice(3);

            // grab up to 3 wolves if possible
            const count = 3 - normalWolves.length;
            let wolves = normalWolves;
            if (count > 0) {
                wolves = [...wolves, ...otherWolves.slice(0, count)];
                otherWolves = otherWolves.slice(count);
            }

            // pick 1 neutral if possible
            let neutral = [];
            if (neutrals.length > 0) {
                neutral = neutrals.slice(0, 1);
                neutrals = neutrals.slice(1);
            }

            shuffledCards = [...town, ...wolves, ...neutral];
            discarded = [...divine, ...otherWolves, ...neutrals];
        }

        shuffledCards = ctx.random.Shuffle(shuffledCards);

        const players = ctx.playOrder.reduce((player, pid) => {
            player[pid] = {
                roles: [],
                alive: false,
                lover: false,
                vote: '',
                chats: {}
            };
            return player;
        }, {});

        // distribute out cards to players except god (host) until it runs out
        const pids = Object.keys(players);
        let playerRoles = extra.doubleIdentity ? 2 : 1;
        let i = 0;
        for (let j = 0; j < playerRoles; j++) {
            let k = 1;
            while (i < shuffledCards.length && k < pids.length) {
                const player = players[pids[k]];
                player.roles.push(shuffledCards[i]);
                player.alive = true;
                i++;
                k++;
            }
        }

        const roles = Array.from(new Set(cards));
        const rolesCount = {};
        for (const cid of cards) {
            if (Object.prototype.hasOwnProperty.call(rolesCount, cid)) {
                rolesCount[cid]++;
            } else {
                rolesCount[cid] = 1;
            }
        }
        const rolesDisplay: string[] = [];
        for (const cid in rolesCount) {
            if (rolesCount[cid] === 1) {
                rolesDisplay.push(Cards[cid].label);
            } else {
                rolesDisplay.push(`${Cards[cid].label}x${rolesCount[cid]}`);
            }
        }

        return {
            god: ctx.currentPlayer,
            roles,
            players,
            discards: [...shuffledCards.slice(i), ...discarded],
            state: 0,
            election: null,
            badge: null,
            chats: {
                '记录': {
                    disabled: true,
                    chat: [
                        {name: '系统', message: '欢迎来到狼人杀！', userID: '00'},
                        {name: '系统', message: `本局角色： ${rolesDisplay.join(',')}`, userID: '00'},
                        {name: '系统', message: '请等待上帝开始游戏。', userID: '00'}
                    ]
                }
            },
            selectionTermsOnly: extra.selectionTermsOnly,
            spectatorsSeeIdentity: extra.spectatorsSeeIdentity,
            deadSeeIdentity: extra.deadSeeIdentity
        };
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
            } else if (!Object.prototype.hasOwnProperty.call(G.players, playerID)) {
                console.log('ERROR:', playerID);
                // hack until I can debug and figure what's going on
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
            } else if (playerID === G.god) {
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
                // what player sees of other players
                if (!G.players[playerID].alive && G.deadSeeIdentity) {
                    players[pid] = G.players[pid];
                } else {
                    const { lover, vote, ...others } = G.players[pid];
                    players[pid] = {
                        ...others,
                        roles: [],
                        lover: lover && (G.players[playerID].lover || G.players[playerID].roles.indexOf(Cards.cupid.id) >= 0),
                        vote: G.reveal ? vote : '',
                        chats: {}
                    };
                }
            }
        }

        const discards =
            (playerID === G.god ||
            (playerID && G.players[playerID].roles.indexOf(Cards.bandit.id) >= 0 && ctx.phase !== 'setup')) ?
                G.discards :
                [];

        return {
            ...G,
            players,
            discards,
            chats: (() => {
                const chats = {};
                for (const cid in G.chats) {
                    if (cid === '记录' || G.chats[cid].participants.indexOf(playerID) >= 0 || (playerID && G.deadSeeIdentity && !G.players[playerID].alive) || G.spectatorsSeeIdentity) {
                        chats[cid] = G.chats[cid];
                    }
                }
                return chats;
            })()
        }
    },

    turn: {
        order: {
            first: (G, ctx) => Number(G.god),
            next: (G, ctx) => Number(G.god)
        }
    },

    phases: {
        setup: {
            moves: { setRole, setDiscard, modifyChat, deleteChat, start },
            next: 'main',
            start: true
        },
        main: {
            turn: {
                order: {
                    first: (G, ctx) => Number(G.god),
                    next: (G, ctx) => Number(G.god),
                },
                onBegin: (G, ctx) => {
                    for (const pid in G.players) {
                        const player = G.players[pid];
                        player.vote = '';
                    }
                    ctx.events.setActivePlayers({ others: 'player', currentPlayer: 'god' })
                    G.state = 0;
                    G.reveal = false;
                },
                stages: {
                    god: {
                        moves: { setRole, setDiscard, transfer, kill, badge, lover, election, reveal, modifyChat, deleteChat, lockChat, freeChat, chat, read, next }
                    },
                    player: {
                        moves: { vote, chat, read }
                    }
                }
            }
        }
    }
};