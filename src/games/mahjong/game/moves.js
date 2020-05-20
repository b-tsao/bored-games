const { INVALID_MOVE } = require('boardgame.io/core');
const constants = require('../constants');

/**
 * Shuffles wall, cuts wall, deals tiles to each player, resolve bonus tiles, sorts player hands.
 * @param {*} G
 * @param {*} ctx
 */
function setup(G, ctx) {
    G.wall.shuffle(ctx.random.Shuffle);

    // Cut the wall, assume the first player always has the first segment of the wall.
    G.wall.cut(G.dice.reduce((acc, dice) => acc + dice, 0));

    // Each player draws four tiles three times.
    for (let i = 0; i < 3; i++) {
        ctx.playOrder.forEach(pid => {
            for (let j = 0; j < 4; j++) {
                dealTile(G, ctx, pid);
            }
        });
    }
    // Each player draws 1 tile.
    ctx.playOrder.forEach(pid => {
        dealTile(G, ctx, pid);
    });
    // First player draws an extra tile.
    dealTile(G, ctx, ctx.currentPlayer);

    // Resolve bonus tiles.
    const playersWithBonusTiles = [];
    ctx.playOrder.forEach(pid => {
        const bonusTiles = G.players[pid].bonus.length;
        if (bonusTiles > 0) {
            playersWithBonusTiles.push([pid, bonusTiles]);
        }
    });
    // Take turns drawing number of bonus tiles until no more new bonus tiles are drawn.
    while (playersWithBonusTiles.length > 0) {
        const [player, bonusTiles] = playersWithBonusTiles.shift();
        const oldBonusTiles = G.players[player].bonus.length;
        for (let i = 0; i < bonusTiles; i++) {
            // Draw from the dead wall.
            dealTile(G, ctx, player, true);
        }
        const newBonusTiles = G.players[player].bonus.length - oldBonusTiles;
        if (newBonusTiles > 0) {
            playersWithBonusTiles.push([player, newBonusTiles]);
        }
    }

    // Sort hands.
    ctx.playOrder.forEach(pid => {
        G.players[pid].hand.sort(sortTilesComparator);
    });

    ctx.events.setStage('discard');
}

/**
 * Roll three d6 dices.
 * @param {*} G 
 * @param {*} ctx 
 */
function rollDice(G, ctx) {
    G.dice = ctx.random.Die(6, 3);
    console.log("player", ctx.playerID, "rolled", G.dice);
}

/**
 * Draw a tile for the player caller.
 * If bonus tile is drawn, stage is set to 'replace', else ends stage.
 * @param {*} G 
 * @param {*} ctx 
 */
function drawTile(G, ctx) {
    const player = G.players[ctx.playerID];
    const bonusTiles = player.bonus.length;
    dealTile(G, ctx, ctx.playerID);

    // If player drew another bonus tile:
    if (player.bonus.length > bonusTiles) {
        ctx.events.setStage('replace');
    } else {
        ctx.events.endStage();
    }
}

/**
 * Draw a replacement tile from the dead wall for the player caller.
 * If bonus tile is drawn, stage is kept, else ended.
 * @param {*} G 
 * @param {*} ctx 
 */
function replaceTile(G, ctx) {
    const player = G.players[ctx.playerID];
    const bonusTiles = player.bonus.length;
    dealTile(G, ctx, ctx.playerID, true);

    if (player.bonus.length === bonusTiles) {
        ctx.events.endStage();
    }
}

/**
 * Discard a tile for the player caller.
 * @param {*} G 
 * @param {*} ctx 
 * @param {*} pos idx of the tile to be discarded on player hand.
 */
function discardTile(G, ctx, pos) {
    const player = G.players[ctx.playerID];
    if (pos == null || pos < 0 || pos >= player.hand.length) {
        return INVALID_MOVE;
    }
    const discard = player.hand.splice(pos, 1)[0];
    G.discard.push(discard);
    console.log("player", ctx.playerID, "discard", pos, discard.suit, discard.value);

    player.hand.sort(sortTilesComparator);

    ctx.events.endStage();
    ctx.events.setActivePlayers({
        others: 'claim'
    });
}

/**
 * Kong for the player caller.
 * Kong can be either concealed kong or small melded kong depending on passed in pos.
 * Player is placed in 'replace' stage upon succesful kong.
 * @param {*} G 
 * @param {*} ctx 
 * @param {*} pos if pos is an array, concealing kong is assumed, else melding kong
 */
function declareKong(G, ctx, pos) {
    const player = G.players[ctx.playerID];
    if (!canKong(G)) {
        return INVALID_MOVE;
    } else if (Array.isArray(pos)) {
        // Concealed kong.
        const tiles = peekTiles(G, ctx.playerID, pos);
        if (tiles === INVALID_MOVE) {
            return INVALID_MOVE;
        }
        if (isKong(tiles)) {
            player.concealed.push(getTiles(G, ctx.playerID, pos));
            console.log("player", ctx.playerID, "declares a concealed kong;", JSON.stringify(tiles));
            ctx.events.setStage('replace');
            return;
        }
    } else {
        // Melded kong.

        // TODO consider how to allow robbing the kong.
        // Robbing the kong occurs when you win off of an opponent's tile that is used to promote a melded pung into a small melded kong.
        // For example, you have 2- and 4-bamboo and are waiting on the 3 in order to win.
        // Your opponent currently has a pung of 3-bamboo melded.
        // He subsequently draws another 3-bamboo with such luck and declares a kong.
        // Unbeknownst to him this is the tile you need and you declare mahjong.
        // Your mahjong trumps his kong as the 3-bamboo completes your hand.
        // This is what it means to rob a kong.

        // TODO for the robbing a kong, don't place the player in 'replace' stage yet, instead place all other players
        // in 'rob' stage for an attempt to rob. If no one robs, player is placed in 'replace' stage.

        if (pos < 0 || pos >= player.hand.length) {
            return INVALID_MOVE;
        }
        const tile = player.hand[pos];
        // Check if player has a pong with the same suit.
        for (const reveal of player.revealed) {
            const { suit } = reveal[0];
            if (suit === tile.suit && isPong(reveal)) {
                // Meld kong.
                reveal.push(player.hand.splice(pos, 1)[0]);
                console.log("player", ctx.playerID, "declares a melded kong;", JSON.stringify(reveal));
                ctx.events.setStage('replace');
                return;
            }
        }
    }
    return INVALID_MOVE;
}

/**
 * Declares claim for the discarded tile for player caller.
 * Nature of the claim is determined by the tiles declared in the claim.
 * Special case of winning claim is declared by not declaring specific tiles in the claim.
 * @param {*} G 
 * @param {*} ctx 
 * @param {*} poss array of idx for tiles in the player hand. To declare a winning claim, pass an empty array.
 */
function claimTile(G, ctx, poss) {
    if (poss == null) {
        return INVALID_MOVE;
    }

    const player = G.players[ctx.playerID];
    const tiles = peekTiles(G, ctx.playerID, poss);
    // Peek at the last discarded tile and push it in.
    const discard = G.discard[G.discard.length - 1];
    tiles.push(discard);
    // See if any claims match.
    const claim =
        // If player clicked two or three tiles, they may be wanting to match and keep playing rather than win.
        // If they really wanted to win, if they get the claim they can still claim victory.
        // Note: They would not have the priority for winning in that case though, so needs to be clearly stated.
        // Also note: If the player thinks trying to claim the chow for the win by clicking the matching tiles
        //            and is not next in turn order, it also wouldn't work. This could be confusing.
        (tiles.length < 3 || tiles.length > 4) && hasWon([...player.hand, discard]) ? "WIN" :
            canKong(G) && isKong(tiles) ? "KONG" :
                isPong(tiles) ? "PONG" :
                    // In order to chow, player has to be turn holder or next in the turn order.
                    (isTurnHolder(ctx) || isNextPlayer(ctx)) && isChow(tiles) ? "CHOW" :
                        null;
    if (claim === null) {
        return INVALID_MOVE;
    }

    const claimer = { pid: ctx.playerID, priority: constants.PRIORITY[claim], claim, tiles: poss };

    if (ctx.playerID === ctx.currentPlayer) {
        revealAndClaim(G, ctx, claimer);
        ctx.events.endStage();
    } else {
        G.claims.push(claimer);
        ctx.events.endStage();
    }
}

/**
 * Declare a skip claim on the discarded tile for player caller.
 * @param {*} G 
 * @param {*} ctx 
 */
function skipTile(G, ctx) {
    G.claims.push({ pid: ctx.playerID, priority: constants.PRIORITY.SKIP });
    ctx.events.endStage();
}

/**
 * Resolve the claims made for the discarded tile.
 * Priority is given to a player who can win with the claim, then those who can kong or pong, then those who can chow.
 * In the event of a tie claim, priotiy is given to the next closest player in the turn order.
 * @param {*} G 
 * @param {*} ctx 
 */
function resolveClaims(G, ctx) {
    // Compare in order of priority, if priority is same, sort in order of turn order from current player.
    const comp = (e1, e2) => {
        if (e1.priority === e2.priority) {
            // sort based on turn order.
            const d1 = e1.pid - ctx.currentPlayer;
            const d2 = e2.pid - ctx.currentPlayer;
            // If d1 and d2 have the same sign:
            if ((d1 ^ d2) >= 0) {
                return d1 - d2;
            } else {
                return d2;
            }
        } else {
            return e2.priority - e1.priority;
        }
    };
    G.claims.sort(comp);
    const claimer = G.claims[0];
    let stage = 'draw';
    // If claimer is not skipping:
    if (claimer.priority > 0) {
        // If claimer is not skipping:
        revealAndClaim(G, ctx, claimer);
        // If kong, replace from dead wall.
        stage = (claimer.tiles.length === 4) ? 'replace' : 'discard';
    }
    // Set the stage of the next player.
    ctx.events.setActivePlayers({
        value: { [claimer.pid]: stage }
    });
}

/**
 * Claims victory for the player caller.
 * If successful, the remainder of the player's hand is organized into complete sets and revealed.
 * @param {*} G 
 * @param {*} ctx 
 */
function claimVictory(G, ctx) {
    const player = G.players[ctx.playerID];
    const sets = hasWon(player.hand);
    if (sets) {
        // Reveal the remaining hand.
        player.revealed = player.revealed.concat(sets);
        player.hand = [];
        revealWinner(G, ctx, ctx.playerID);
    } else {
        console.log("player", ctx.playerID, "wants to check hu (won), but don't worry about it, no one won yet.");
        return INVALID_MOVE;
    }
}

// Support functions

function dealTile(G, ctx, playerID, dead = false) {
    const player = G.players[playerID];
    const tile = G.wall.draw(dead);
    if (isBonusTile(tile)) {
        player.bonus.push(tile);
    } else {
        player.hand.push(tile);
    }
    console.log("player", playerID, "dealt", tile.suit, tile.value);
}

function revealAndClaim(G, ctx, claimer) {
    const player = G.players[claimer.pid];
    const claim = G.discard.pop();
    if (claimer.claim === "WIN") {
        const sets = hasWon([...player.hand, claim]);
        if (sets) {
            // Reveal the remaining hand.
            player.revealed = player.revealed.concat(sets);
            player.hand = [];
            revealWinner(G, ctx, claimer.pid);
        } else {
            throw new Error("Invalid game state");
        }
    } else {
        const tiles = getTiles(G, claimer.pid, claimer.tiles);
        console.log("player", claimer.pid, "revealed", JSON.stringify(tiles), "and claimed", JSON.stringify(claim));
        tiles.push(claim);
        tiles.sort(sortTilesComparator);
        player.revealed.push(tiles);
    }
}

function revealWinner(G, ctx, playerID) {
    const player = G.players[playerID];

    // Reveal any concealed kongs.
    player.revealed = player.revealed.concat(player.concealed);
    player.concealed = [];


    console.log(`Congratulations ${playerID}, mahjong!`);
    ctx.events.endGame(`Congratulations ${playerID}, mahjong!`);
}

function peekTiles(G, playerID, positions) {
    const player = G.players[playerID];
    // Get the tiles from the player hand.
    const tiles = [];
    // Validate the positions as well.
    const set = new Set(positions);
    for (const pos of set) {
        if (pos < 0 || pos >= player.hand.length) {
            return INVALID_MOVE;
        }
        tiles.push(player.hand[pos]);
    }
    return tiles;
}

function getTiles(G, playerID, positions) {
    const player = G.players[playerID];
    // Make sure no dups
    positions = Array.from(new Set(positions));
    // Sort in descending order
    positions.sort((e1, e2) => { return e2 - e1 });
    // Remove the tiles from player hand and push into concealed.
    const tiles = [];
    for (const pos of positions) {
        if (pos < 0 || pos >= player.hand.length) {
            return INVALID_MOVE;
        }
        tiles.push(player.hand.splice(pos, 1)[0]);
    }
    return tiles;
}

function sortTilesComparator(t1, t2) {
    if (t1.suit > t2.suit) {
        return 1;
    } else if (t1.suit === t2.suit) {
        return (t1.value > t2.value ? 1 : -1);
    } else {
        return -1;
    }
}

function canKong(G) {
    // TODO check if kong is allowed in every game or is it optional
    return G.wall.deadLength > 0;
}

function hasWon(tiles) {
    const sortedTiles = [...tiles];
    sortedTiles.sort(sortTilesComparator);
    // We don't need to use a Set() here because even if there are duplicate chows ((suit) 123, 123),
    // it would be sorted as 112233, which wouldn't be recognized as a chow or pong.
    const sets = [];
    let hasDouble = false;
    // Prune out all the sets of pong, chow, and one double.
    let length = sortedTiles.length;
    while (length > 1) {
        let next = Math.min(3, length);
        let set = sortedTiles.slice(length - next, length);
        if (next === 3 && !isPong(set) && !isChow(set)) {
            next--;
            set = sortedTiles.slice(length - next, length);
        }
        if (next === 2) {
            if (isDouble(set)) {
                if (hasDouble) {
                    return null;
                } else {
                    hasDouble = true;
                }
            } else {
                next--;
            }
        }
        if (next > 1) {
            set = sortedTiles.splice(length - next, next);
            sets.push(set);
        }
        length -= next;
    }
    // If there are two remaining tiles left and no doubles found yet, the tiles could be a split.
    // This means they could be (suit) {0, 2}, {1, 3}, {2, 4}, ...
    // It's possible the tiles were sorted as (suit) 12223 and pong took out 222 leaving 13,
    // thus check if sets contain the (suit) pong and if the value will make a chow.
    if (!hasDouble && sortedTiles.length === 2 &&
        sortedTiles[0].suit === sortedTiles[1].suit && sortedTiles[1].value - sortedTiles[0].value === 2) {
        // The tiles are split.
        // This means they could be (suit) {2, 0}, {3, 1}, {4, 2}, ...
        // It's possible the tiles were sorted as (suit) 12223 and pong took out 222 leaving 13,
        // thus check if sets contain the (suit) pong and if the value will make a chow.
        for (const set of sets) {
            if (isPong(set) &&
                sortedTiles[0].suit === set[0].suit &&
                sortedTiles[0].value < set[0].value &&
                sortedTiles[1].value > set[0].value) {
                // Swap the tile over
                const tile = set.splice(set.length - 1, 1)[0];
                hasDouble = true;

                // Chow.
                sortedTiles.splice(1, 0, tile);
                sets.push(sortedTiles);
            }
        }
    }
    return hasDouble ? sets : null;
}

function isKong(tiles) {
    if (tiles.length !== 4) {
        return false;
    }
    const tile = tiles[0];
    return tiles.every(({ suit, value }) => suit === tile.suit && value === tile.value);
}

function isPong(tiles) {
    if (tiles.length !== 3) {
        return false;
    }
    const tile = tiles[0];
    return tiles.every(({ suit, value }) => suit === tile.suit && value === tile.value);
}

function isChow(tiles) {
    if (tiles.length !== 3) {
        return false;
    }
    const sortedTiles = [...tiles];
    sortedTiles.sort(sortTilesComparator);
    const tile = sortedTiles[0];
    if (!constants.EDIBLE.includes(tile.suit)) {
        return false;
    }
    let next = tile.value + 1;
    return sortedTiles.every(({ suit, value }, i) => i === 0 || (suit === tile.suit && value === next++));
}

function isDouble(tiles) {
    if (tiles.length !== 2) {
        return false;
    }
    return tiles[0].suit === tiles[1].suit && tiles[0].value === tiles[1].value;
}

function isBonusTile(tile) {
    return constants.BONUS.includes(tile.suit);
}

function isTurnHolder(ctx) {
    return ctx.playerID === ctx.currentPlayer;
}

function isNextPlayer(ctx) {
    return Number(ctx.playerID) === (ctx.playOrderPos + 1) % ctx.numPlayers;
}

module.exports = {
    setup,
    rollDice,
    drawTile,
    replaceTile,
    discardTile,
    declareKong,
    claimTile,
    skipTile,
    resolveClaims,
    claimVictory
};