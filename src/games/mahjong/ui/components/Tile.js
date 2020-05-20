import React from 'react';
import { TILE_IMAGE_MAP } from './TileImageMap';

export function Tile(props) {
  return <img src={TILE_IMAGE_MAP[props.suit + props.value]} />;
}
