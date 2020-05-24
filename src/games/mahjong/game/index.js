const { ActivePlayers } = require('boardgame.io/core');
const Wall = require('./Wall');
const {
    claimTile,
    claimVictory,
    declareKong,
    discardTile,
    drawTile,
    replaceTile,
    rollDice,
    setup,
    skipTile,
    resolveClaims
} = require('./moves');
const constants = require('../constants');

function newHand(ctx) {
    return {
        players: ctx.playOrder.reduce((acc, pid) => {
            acc[pid] = {
                hand: [],
                revealed: [],
                concealed: [], // Used for concealed kongs
                bonus: []
            };
            return acc;
        }, {}),
        dice: [],
        discard: [],
        wall: new Wall(),
        claims: [],
        winner: null // Used for hand winner
    };
}

/**
 * game = 4 rounds = 16 hands minimum (If dealer wins, hand continues without rotating)
 *   - round (east, south, west, north)
 *     - hand (rotate east, south, west, north)
 */
const MahjongGame = {
    name: 'mahjong',

    setup: (ctx) => ({
        // Wind always starts off as East, if wind is East again, game ends.
        wind: 0,
        // Player 0 always starts off as East, if East is player 0 again, wind changes.
        east: 0,
        ...newHand(ctx)
    }),

    // Parse data for what each player sees.
    playerView: (G, ctx, playerID) => !Wall.prototype.isPrototypeOf(G.wall) ? G : {
        wind: constants.WIND[G.wind],
        east: G.east,
        players: (() => {
            const players = {};
            for (const pid in G.players) {
                if (pid === playerID) {
                    players[pid] = G.players[pid];
                } else {
                    const { hand, concealed, ...others } = G.players[pid];
                    players[pid] = {
                        hand: hand.length,
                        concealed: concealed.map(c => "kong"),
                        ...others
                    };
                }
            }
            return players;
        })(),
        dice: G.dice,
        discard: G.discard,
        wall: {
            live: G.wall.length,
            dead: G.wall.deadLength
        },
        claims: G.claims.map(claim => playerID === claim.pid ? claim : claim.pid)
    },

    phases: {
        setup: {
            onEnd: setup,
            endIf: (G, ctx) => G.dice.length > 0,
            turn: {
                order: {
                    // East always starts by rolling dice for cut.
                    first: (G, ctx) => G.east
                }
            },
            moves: { rollDice },
            next: 'main',
            start: true
        },
        main: {
            turn: {
                order: {
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: (G, ctx) => Number(ctx.currentPlayer),

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: (G, ctx) => Number(G.claims[0].pid)
                },
                onBegin: (G, ctx) => {
                    G.claims = [];
                },
                onEnd: resolveClaims,
                endIf: (G, ctx) => G.claims.length === ctx.numPlayers - 1,
                stages: {
                    draw: {
                        moves: {
                            drawTile: {
                                move: drawTile,
                                client: false
                            },
                            claimTile
                        },
                        next: 'discard'
                    },
                    replace: {
                        moves: {
                            replaceTile: {
                                move: replaceTile,
                                client: false
                            }
                        },
                        next: 'discard'
                    },
                    discard: {
                        moves: { discardTile, declareKong, claimVictory }
                    },
                    claim: {
                        moves: { claimTile, skipTile }
                    }
                }
            },
            next: 'break'
        },
        break: {
            onBegin: (G, ctx) => {
                G.claims = [];
            },
            onEnd: (G, ctx) => {
                const newG = { wind: G.wind, east: G.east };
                // Rotate east if necessary:
                if (G.winner !== null && G.winner != G.east) {
                    newG.east = (newG.east + 1) % ctx.numPlayers;
                    // If east is player 0 again, rotate wind:
                    if (newG.east === 0) {
                        newG.wind = (newG.wind + 1) % constants.WIND.length;
                        // If wind is east again, end game:
                        if (newG.wind === 0) {
                            // Should we force end game if it's been a "full game" (4 rounds)?
                            // ctx.events.endGame();
                        }
                    }
                }
                // Reset player hands.
                return { ...newG, ...newHand(ctx) };
            },
            endIf: (G, ctx) => G.claims.length === ctx.numPlayers,
            turn: {
                activePlayers: ActivePlayers.ALL_ONCE
            },
            moves: { skipTile },
            next: 'setup'
        }
    }
};

module.exports = { MahjongGame };