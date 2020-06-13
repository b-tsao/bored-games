import constants from '../constants.json';

export default class Wall {
    tiles: { suit: string, value: number }[];
    deadLength: number;
    deadTop: boolean;

    constructor() {
        // Head of wall = end. Tail of wall = head.
        // Simple reason: pop() is faster than shift().
        this.tiles = [];
        this.deadLength = 16;
        this.deadTop = true;

        for (const suit in constants.TILES) {
            const tile = constants.TILES[suit];
            for (let i = 1; i <= tile.values; i++) {
                for (let j = 0; j < tile.count; j++) {
                    this.tiles.push({ suit, value: i });
                }
            }
        }
    }

    get length() {
        return this.tiles.length - this.deadLength;
    }

    shuffle(shuffler) {
        if (typeof shuffler === 'function') {
            this.tiles = shuffler(this.tiles);
        }
    }

    cut(count) {
        // 1) Imagine the wall head is on the rightmost of east's tile (idx = this.tail.length - 1).
        // 2) Counting counter clock wise means 2 will end on east's righthand side (south), 4 will end on east's lefthand side (north).
        // 3) This also means the tail of the wall is on south's lefthand side, (idx = 0)
        // 4) Thus we add 2 to the count, mod 4, and add 1 to adjust the relative positions.
        // 5) Now 1 = S, 2 = W, 3 = N, 4 = E which are the proper segments.
        const segment = ((count + 2) % 4) + 1;
        const segmentSize = this.tiles.length / 4;
        const cutPoint = segment * segmentSize - count * 2;
        this.tiles = [...this.tiles.slice(cutPoint, this.tiles.length), ...this.tiles.slice(0, cutPoint)];
    }

    draw(dead = false) {
        if (dead) {
            // Alternate picking 1, 0, 1, 0, ...
            //      | 1 | 3 | 5 | 7 | 9 |
            // dead --------------------- live
            //      | 0 | 2 | 4 | 6 | 8 |
            if (this.deadTop) {
                this.deadTop = false;
                return this.tiles.splice(1, 1)[0];
            } else {
                this.deadTop = true;
                return this.tiles.shift();
            }
        } else if (this.tiles.length > this.deadLength) {
            return this.tiles.pop();
        } else {
            // Out of live wall.
            return null;
        }
    }
}