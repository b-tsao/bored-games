import { ActivePlayers } from 'boardgame.io/core';
import {
    swap,
    select,
    link,
    murder,
    examine,
    cure,
    poison,
    guard,
    grant,
    kill,
    badge,
    vote
} from './moves';
import constants from '../constants.json';
import Player from './player';

export const ChineseWerewolf = {
    name: 'chinese-werewolf',

    // setup: (ctx, setupData) => ({
    //     players: ctx.playOrder.map(() => new Player())
    // }),
    setup: (ctx, setupData) => {
        console.log('setup', ctx, setupData);
        const { cards } = setupData;
        let shuffledCards = cards;
        for (let i = 0; i < 3; i++) {
            shuffledCards = ctx.random.Shuffle(cards);
        }
        return {
            players: ctx.playOrder.reduce((player, pid) => {
                player[pid] = new Player(shuffledCards[pid])
                return player;
            }, {}),
        };
    },

    playerView: (G, ctx, playerID) => ({
        players: (() => {
            const players = {};
            for (const pid in G.players) {
                if (pid === playerID) {
                    players[pid] = G.players[pid];
                } else {
                    players[pid] = {};
                }
            }
            return players;
        })()
    }),

    phases: {
        setup: {
            stages: {
                roles: {
                    moves: {
                        swap
                    }
                },
                setup: {
                    stage: {
                        bandit: {
                            moves: {
                                select
                            }
                        },
                        cupid: {
                            moves: {
                                link
                            }
                        }
                    }
                }
            },
            start: true,
            next: 'night'
        },
        night: {
            stages: {
                werewolf: {
                    moves: {
                        murder
                    }
                },
                prophet: {
                    moves: {
                        examine
                    }
                },
                witch: {
                    moves: {
                        cure,
                        poison
                    }
                },
                bodyguard: {
                    moves: {
                        guard
                    }
                },
                citizen: {
                    moves: {
                        // none, nobodies
                    }
                }
            },
            next: 'day'
        },
        day: {
            stages: {
                god: {
                    moves: {
                        grant,
                        kill,
                        badge
                    }
                },
                vote: {
                    moves: {
                        vote
                    }
                },
                reveal: {
                    moves: {
                        // none
                    }
                }
            },
            next: 'night'
        }
    }
};

// /**
//  * game = 4 rounds = 16 hands minimum (If dealer wins, hand continues without rotating)
//  *   - round (east, south, west, north)
//  *     - hand (rotate east, south, west, north)
//  */
// export const ChineseWerewolf = {
//     name: 'chinese-werewolf',

//     setup: (ctx) => ({
//         // Wind always starts off as East, if wind is East again, game ends.
//         wind: 0,
//         // Player 0 always starts off as East, if East is player 0 again, wind changes.
//         east: 0,
//         ...newHand(ctx)
//     }),

//     // Parse data for what each player sees.
//     playerView: (G, ctx, playerID) => !Wall.prototype.isPrototypeOf(G.wall) ? G : {
//         wind: constants.WIND[G.wind],
//         east: G.east,
//         players: (() => {
//             const players = {};
//             for (const pid in G.players) {
//                 if (pid === playerID) {
//                     players[pid] = G.players[pid];
//                 } else {
//                     const { hand, concealed, ...others } = G.players[pid];
//                     players[pid] = {
//                         hand: hand.length,
//                         concealed: concealed.map(c => 'kong'),
//                         ...others
//                     };
//                 }
//             }
//             return players;
//         })(),
//         dice: G.dice,
//         discard: G.discard,
//         wall: {
//             live: G.wall.length,
//             dead: G.wall.deadLength
//         },
//         claims: G.claims.map(claim => playerID === claim.pid ? claim : claim.pid)
//     },

//     phases: {
//         setup: {
//             onEnd: setup,
//             endIf: (G, ctx) => G.dice.length > 0,
//             turn: {
//                 order: {
//                     // East always starts by rolling dice for cut.
//                     first: (G, ctx) => G.east,
//                     next: (G, ctx) => undefined
//                 }
//             },
//             moves: { rollDice },
//             next: 'main',
//             start: true
//         },
//         main: {
//             turn: {
//                 order: {
//                     // Get the initial value of playOrderPos.
//                     // This is called at the beginning of the phase.
//                     first: (G, ctx) => Number(ctx.currentPlayer),

//                     // Get the next value of playOrderPos.
//                     // This is called at the end of each turn.
//                     // The phase ends if this returns undefined.
//                     next: (G, ctx) => Number(G.claims[0].pid)
//                 },
//                 onBegin: (G, ctx) => {
//                     G.claims = [];
//                 },
//                 onEnd: resolveClaims,
//                 endIf: (G, ctx) => G.claims.length === ctx.numPlayers - 1,
//                 stages: {
//                     discard: {
//                         moves: {
//                             discardTile,
//                             declareKong: {
//                                 move: declareKong,
//                                 client: false
//                             },
//                             claimVictory
//                         }
//                     },
//                     claim: {
//                         moves: { claimTile, skipTile }
//                     }
//                 }
//             },
//             next: 'break'
//         },
//         break: {
//             onBegin: (G, ctx) => {
//                 G.claims = [];
//             },
//             onEnd: (G, ctx) => {
//                 const newG = { wind: G.wind, east: G.east };
//                 // Rotate east if necessary:
//                 if (G.winner !== null && G.winner !== G.east.toString()) {
//                     newG.east = (newG.east + 1) % ctx.numPlayers;
//                     // If east is player 0 again, rotate wind:
//                     if (newG.east === 0) {
//                         newG.wind = (newG.wind + 1) % constants.WIND.length;
//                         // If wind is east again, end game:
//                         if (newG.wind === 0) {
//                             // Should we force end game if it's been a "full game" (4 rounds)?
//                             // ctx.events.endGame();
//                         }
//                     }
//                 }
//                 // Reset player hands.
//                 return { ...newG, ...newHand(ctx) };
//             },
//             endIf: (G, ctx) => G.claims.length === ctx.numPlayers,
//             turn: {
//                 activePlayers: ActivePlayers.ALL_ONCE
//             },
//             moves: { skipTile },
//             next: 'setup'
//         }
//     }
// };