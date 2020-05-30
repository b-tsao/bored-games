import React from "react";
import { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";

import { Tile } from "./Tile";
import { TileBack } from "./TileBack";
import { TILE_HEIGHT_PX } from "./constants";

const useStyles = makeStyles({
    root: {},
    tileHeight: {
        height: TILE_HEIGHT_PX,
    },
});

/**
 * Opponent's hand in a two row format.
 * @param {object} props.hand - Object representing opponent's hand.
 * @param {array} props.hand.bonus - List of bonus tiles.
 * @param {array} props.hand.concealed - List of concealed groups.
 * @param {integer} props.hand.hand - Number of tiles in hand.
 * @param {array} props.hand.revealed - List of revealed groups.
 * @param {string} props.seat - Location of opponent's seat. This determines how tiles are arranged.
 *                              Possible values are "top", "left", and "right".
 */
export function OpponentHand(props) {
    const classes = useStyles();

    const [bonus, setBonus] = useState([]);
    const [concealed, setConcealed] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [hand, setHand] = useState([]);

    useEffect(() => {
        setBonus(
            props.hand.bonus.map((tile) => {
                return (
                    <Box key={tile.suit + tile.value}>
                        <Tile suit={tile.suit} value={tile.value} />
                    </Box>
                );
            })
        );
    }, [props.hand.bonus]);

    useEffect(() => {
        setConcealed(
            props.hand.concealed.map((_, setIndex) => {
                return new Array(4).fill().map((_, tileIndex) => {
                    return (
                        <Box key={setIndex + tileIndex}>
                            <TileBack />
                        </Box>
                    );
                });
            })
        );
    }, [props.hand.concealed]);

    useEffect(() => {
        setRevealed(
            props.hand.revealed.map((set, setIndex) => {
                return set.map((tile, tileIndex) => {
                    return (
                        <Box key={setIndex + tileIndex + tile.suit + tile.value}>
                            <Tile suit={tile.suit} value={tile.value} />
                        </Box>
                    );
                });
            })
        );
    }, [props.hand.revealed]);

    useEffect(() => {
        setHand(
            new Array(props.hand.hand).fill().map((_, tileIndex) => {
                return (
                    <Box key={tileIndex}>
                        <TileBack />
                    </Box>
                );
            })
        );
    }, [props.hand.hand]);

    return (
        <Box display="flex">
            {/* Top-seated player */}
            {props.seat === "top" && (
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Box display="flex" mb={1}>
                        {hand}
                    </Box>
                    <Box display="flex" className={classes.tileHeight}>
                        {bonus}
                        {concealed}
                        {revealed}
                    </Box>
                </Box>
            )}
            {/* Left-seated player */}
            {props.seat === "left" && (
                <Box display="flex" flexDirection="column">
                    <Box display="flex" mb={1} className={classes.tileHeight}>
                        {bonus}
                        {concealed}
                        {revealed}
                    </Box>
                    <Box display="flex">{hand}</Box>
                </Box>
            )}
            {/* Right-seated player */}
            {props.seat === "right" && (
                <Box display="flex" flexDirection="column">
                    <Box display="flex" mb={1} className={classes.tileHeight}>
                        {bonus}
                        {concealed}
                        {revealed}
                    </Box>
                    <Box display="flex">{hand}</Box>
                </Box>
            )}
        </Box>
    );
}
