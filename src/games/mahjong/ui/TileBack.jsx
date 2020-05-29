import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";

import { TILE_HEIGHT_PX, TILE_WIDTH_PX } from "./constants";

const useStyles = makeStyles({
  root: {
    width: TILE_WIDTH_PX,
    height: TILE_HEIGHT_PX,
    backgroundColor: "green",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: 10,
    boxSizing: "border-box",
  },
});

export function TileBack(props) {
  const classes = useStyles();

  return <Box display="flex" className={classes.root}></Box>;
}
