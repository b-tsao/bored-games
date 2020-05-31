import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";

import {
    TILE_HEIGHT_LARGE_PX,
    TILE_HEIGHT_PX,
    TILE_WIDTH_LARGE_PX,
    TILE_WIDTH_PX,
} from "./constants";
import { TILE_IMAGE_MAP } from "./TileImageMap";

const useStyles = makeStyles({
    root: {},
    tileImage: {
        width: (props: { large }) => (props.large === true ? TILE_WIDTH_LARGE_PX : TILE_WIDTH_PX),
        height: (props: { large }) => (props.large === true ? TILE_HEIGHT_LARGE_PX : TILE_HEIGHT_PX),
    },
});

/**
 * Tile with SVG image.
 * @param {boolean} props.large - Flag to indicate rendering large tile.
 * @param {string} props.suit - Tile suit to render.
 * @param {string} props.value - Tile value to render.
 */
export function Tile(props) {
    const classes = useStyles(props);

    return (
        <Box display="flex" className={classes.root}>
            <img
                src={TILE_IMAGE_MAP[props.suit + props.value]}
                alt={props.suit + props.value}
                className={classes.tileImage}
            />
        </Box>
    );
}
