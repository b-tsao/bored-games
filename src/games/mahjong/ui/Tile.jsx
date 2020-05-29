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
        width: (props) => (props.large === true ? TILE_WIDTH_LARGE_PX : TILE_WIDTH_PX),
        height: (props) => (props.large === true ? TILE_HEIGHT_LARGE_PX : TILE_HEIGHT_PX),
    },
});

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
