export function getTileIndexCombinations(tiles) {
    const sortedIndices = getSortedIndices(tiles, sortTilesComparator);
    const sets: any[][] = [];
    let hasDouble = false;
    // Prune out all the sets of pong, chow, and one double.
    let length = sortedIndices.length;
    while (length > 1) {
        let next =
            length >= 12 ? 12 :
                length >= 6 ? 6 :
                    length >= 3 ? 3 :
                        length;
        let set = getTiles(tiles, sortedIndices.slice(length - next, length));
        // Check if 111122223333:
        if (next === 12 && !isChow(set)) {
            next -= 6;
            set = getTiles(tiles, sortedIndices.slice(length - next, length));
        }
        // Check if 112233:
        if (next === 6 && !isChow(set)) {
            next -= 3;
            set = getTiles(tiles, sortedIndices.slice(length - next, length));
        }
        // Check if 111 || 123:
        if (next === 3 && !isPong(set) && !isChow(set)) {
            next--;
            set = getTiles(tiles, sortedIndices.slice(length - next, length));
        }
        // Check if 11:
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
    if (!hasDouble && sortedTiles.length === 2 &&
        sortedTiles[0].suit === sortedTiles[1].suit) {
        if (sortedTiles[1].value - sortedTiles[0].value === 2) {
            // The tiles are split.
            // This means they could be (suit) {0, 2}, {1, 3}, {2, 4}, ...
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

                    // Insert the tile between to make the chow.
                    sortedTiles.splice(1, 0, tile);
                    // Push the last remaining set.
                    sets.push(sortedTiles.splice(0, sortedTiles.length));
                    break;
                }
            }
        } else if (sortedTiles[1].value - sortedTiles[0].value === 1) {
            // The tiles are only 1 value apart.
            // This means they could be (suit) {1, 2}, {2, 3}, ...
            // It's possible the tiles were sorted as (suit) 12222333 and pong took out 222 and 333 leaving 12,
            // thus check if sets contain the (suit) pong and if the value will make a chow.
            for (const set of sets) {
                if (isPong(set) && sortedTiles[0].suit === set[0].suit) {
                    if (
                        // If the set value is smaller (1) < (23):
                        sortedTiles[0].value - set[0].value === 1 &&
                        sortedTiles[1].value - set[0].value === 2) {
                        // Swap the tile over
                        const tile = set.splice(set.length - 1, 1)[0];
                        hasDouble = true;

                        // Insert the tile between to make the chow.
                        sortedTiles.splice(0, 0, tile);
                        // Push the last remaining set.
                        sets.push(sortedTiles.splice(0, sortedTiles.length));
                        break;
                    } else if (
                        // If the set value is greater (3) > (12):
                        set[0].value - sortedTiles[0].value === 2 &&
                        set[0].value - sortedTiles[1].value === 1) {
                        // Swap the tile over
                        const tile = set.splice(set.length - 1, 1)[0];
                        hasDouble = true;

                        // Insert the tile between to make the chow.
                        sortedTiles.push(tile);
                        // Push the last remaining set.
                        sets.push(sortedTiles.splice(0, sortedTiles.length));
                        break;
                    }
                }
            }
        }
    }
    return sortedTiles.length === 0 && hasDouble ? sets : null;
}

/**
 * Takes in an array and returns a sorted array of indices of that array using the comparator.
 * @param arr array to sort
 * @param comparator comparator function
 * @returns sorted passed in array of indices
 */
function getSortedIndices(arr, comparator) {
    const idxs = Array.from(Array(arr.length).keys());
    idxs.sort((i1, i2) => comparator(arr[i1], arr[i2]));
    return idxs;
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

/**
 * Transformer to return the tiles of the index or indices.
 * @param tiles tiles
 * @param idx index or indices
 * @returns tile of the index or array of tiles of the indices
 */
function getTiles(tiles, idx): number | number[] {
    if (Array.isArray(idx)) {
        return idx.map(i => tiles[i]);
    } else {
        return tiles[idx];
    }
}