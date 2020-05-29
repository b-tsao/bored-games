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

export function OpponentHand(props) {
  const classes = useStyles();

  const [bonus, setBonus] = useState([]);
  const [concealed, setConcealed] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [hand, setHand] = useState([]);

  // useEffect(() => {
  //   function createBonus(num) {
  //     let temp = [];
  //     for (let i = 0; i < num; i++) {
  //       temp.push(<Tile suit="flower" value={(i % 4) + 1} rotate={rotateTile} />);
  //     }
  //     return temp;
  //   }

  //   function createKong(num) {
  //     let temp = [];
  //     for (let i = 0; i < num; i++) {
  //       for (let j = 0; j < 4; j++) {
  //         temp.push(<TileBack rotate={rotateTileBack} />);
  //       }
  //     }
  //     return temp;
  //   }

  //   function createSet(num) {
  //     let temp = [];
  //     for (let i = 0; i < num; i++) {
  //       for (let j = 1; j <= 3; j++)
  //         temp.push(<Tile suit="bamboo" value={j} rotate={rotateTile} />);
  //     }
  //     return temp;
  //   }

  //   function createHand(num) {
  //     let temp = [];
  //     for (let i = 0; i < num; i++) {
  //       temp.push(<TileBack rotate={rotateTileBack} />);
  //     }
  //     return temp;
  //   }

  //   setBonus(createBonus(1));
  //   setConcealed(createKong(0));
  //   setRevealed(createSet(1));
  //   setHand(createHand(14));
  // }, []);

  useEffect(() => {
    setBonus(
      props.hand.bonus.map((tile, index) => {
        return (
          <Box key={index}>
            <Tile suit={tile.suit} value={tile.value} />
          </Box>
        );
      })
    );
  }, [props.hand.bonus]);

  useEffect(() => {
    // TODO: unique key for each
    setConcealed(
      props.hand.concealed.map((set) => {
        return new Array(4).fill(<TileBack />);
      })
    );
  }, [props.hand.concealed]);

  useEffect(() => {
    // TODO: unique key for each
    setRevealed(
      props.hand.revealed.map((set) => {
        return set.map((tile) => {
          return <Tile suit={tile.suit} value={tile.value} />;
        });
      })
    );
  }, [props.hand.revealed]);

  useEffect(() => {
    setHand(
      [...Array(props.hand.hand).keys()].map((index) => {
        return (
          <Box key={index}>
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
