import React from "react";
import { useEffect, useState } from "react";

import { Box } from "@material-ui/core";

import { Tile } from "./Tile";

export function DiscardPile(props) {
  const [discard, setDiscard] = useState([]);

  // useEffect(() => {
  //   function createDiscard(num) {
  //     let temp = [];
  //     for (let i = 0; i < num; i++) {
  //       temp.push(<Tile suit="character" value={(i % 9) + 1} />);
  //     }
  //     return temp;
  //   }

  //   setDiscard(createDiscard(144));
  // }, []);

  useEffect(() => {
    setDiscard(
      props.discard.map((tile, index) => {
        return (
          <Box key={index}>
            <Tile suit={tile.suit} value={tile.value} />
          </Box>
        );
      })
    );
  }, [props.discard]);

  return (
    <Box display="flex" flexWrap="wrap">
      {discard}
    </Box>
  );
}
