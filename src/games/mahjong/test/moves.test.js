const constants = require('../constants');
const {
    hasWon
} = require('../game/moves');

const CIRCLE = "circle";
const BAMBOO = "bamboo";
const CHARACTER = "character";
const WIND = "wind";
const DRAGON = "dragon";
const SEASON = "season";
const FLOWER = "flower";

describe('Test hasWon', () => {
    let tiles;
    beforeAll(() => {
        tiles = {}
        for (const suit in constants.TILES) {
            const tile = constants.TILES[suit];
            tiles[suit] = [{ /* dummy */ }];
            for (let i = 1; i <= tile.values; i++) {
                tiles[suit].push({ suit, value: i });
            }
        }
    });

    test('Win with four pongs and a double', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[BAMBOO][3],
            tiles[BAMBOO][3],
            tiles[BAMBOO][3],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][3], tiles[CIRCLE][3], tiles[CIRCLE][3]],
            [tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][1]],
            [tiles[CHARACTER][7], tiles[CHARACTER][7], tiles[CHARACTER][7]],
            [tiles[BAMBOO][3], tiles[BAMBOO][3], tiles[BAMBOO][3]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2]]
        ]);
    });

    test('Win with double chows, two pongs, and a double', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CIRCLE][7],
            tiles[CIRCLE][7],
            tiles[CIRCLE][7],
            tiles[BAMBOO][3],
            tiles[BAMBOO][3],
            tiles[BAMBOO][3],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][7], tiles[CIRCLE][7], tiles[CIRCLE][7]],
            [tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][3], tiles[CIRCLE][3]],
            [tiles[BAMBOO][3], tiles[BAMBOO][3], tiles[BAMBOO][3]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2]]
        ]);
    });

    test('Win with double chows, two pongs, and a double but scrambled', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[BAMBOO][3],
            tiles[CHARACTER][6],
            tiles[BAMBOO][3],
            tiles[CHARACTER][5],
            tiles[CHARACTER][6],
            tiles[CHARACTER][7],
            tiles[CHARACTER][5],
            tiles[CHARACTER][7],
            tiles[BAMBOO][2],
            tiles[CIRCLE][1],
            tiles[BAMBOO][3],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][1]],
            [tiles[CHARACTER][5], tiles[CHARACTER][5], tiles[CHARACTER][6], tiles[CHARACTER][6], tiles[CHARACTER][7], tiles[CHARACTER][7]],
            [tiles[BAMBOO][3], tiles[BAMBOO][3], tiles[BAMBOO][3]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2]]
        ]);
    });

    test('Win with quadra chows and a double', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CIRCLE][2],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CHARACTER][7],
            tiles[CIRCLE][2],
            tiles[CHARACTER][7],
            tiles[CIRCLE][2],
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][1], tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][3], tiles[CIRCLE][3], tiles[CIRCLE][3], tiles[CIRCLE][3]],
            [tiles[CHARACTER][7], tiles[CHARACTER][7]]
        ]);
    });

    test('Win with a chow that seems to be part of a pong (circle 12223)', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[BAMBOO][3],
            tiles[BAMBOO][3],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CIRCLE][3],
            tiles[BAMBOO][3],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][2], tiles[CIRCLE][2]],
            [tiles[CHARACTER][7], tiles[CHARACTER][7], tiles[CHARACTER][7]],
            [tiles[BAMBOO][3], tiles[BAMBOO][3], tiles[BAMBOO][3]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2], tiles[BAMBOO][2]],
            [tiles[CIRCLE][1], tiles[CIRCLE][2], tiles[CIRCLE][3]]
        ]);
    });

    test('Win with a chow embedded in a kong and pong', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CIRCLE][3],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][3], tiles[CIRCLE][3]],
            [tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][2]],
            [tiles[CHARACTER][7], tiles[CHARACTER][7], tiles[CHARACTER][7]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2], tiles[BAMBOO][2]],
            [tiles[CIRCLE][1], tiles[CIRCLE][2], tiles[CIRCLE][3]]
        ]);
    });

    test('Win with a chow embedded in a kong and pong #2', () => {
        const hand = [
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][1],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][2],
            tiles[CIRCLE][3],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[CHARACTER][7],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2],
            tiles[BAMBOO][2]
        ];
        expect(hasWon(hand)).toEqual([
            [tiles[CIRCLE][2], tiles[CIRCLE][2], tiles[CIRCLE][2]],
            [tiles[CIRCLE][1], tiles[CIRCLE][1]],
            [tiles[CHARACTER][7], tiles[CHARACTER][7], tiles[CHARACTER][7]],
            [tiles[BAMBOO][2], tiles[BAMBOO][2], tiles[BAMBOO][2]],
            [tiles[CIRCLE][1], tiles[CIRCLE][2], tiles[CIRCLE][3]]
        ]);
    });
});