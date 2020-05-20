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

const MahjongGame = {
    name: 'mahjong',

    setup: (ctx) => ({
        players: ctx.playOrder.reduce((acc, pid) => {
            acc[pid] = {
                hand: [],
                revealed: [],
                concealed: [], // Used for concealed kongs
                bonus: []
            };
            return acc;
        }, {}),
        // Value of dice roll.
        dice: [],
        // Discard pile.
        discard: [],
        // Wall of tiles.
        wall: new Wall(),
        claims: []
    }),

    // Parse data for what each player sees.
    playerView: (G, ctx, playerID) => !Wall.prototype.isPrototypeOf(G.wall) ? G : {
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
            }
        }
    }
};

module.exports = { MahjongGame };