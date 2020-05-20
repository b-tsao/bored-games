import { useEffect, useState } from 'react';
import { Tile } from './Tile';
import React from 'react';

export function DiscardPile(props) {
  const [discardPile, setDiscardPile] = useState([]);

  useEffect(() => {
    setDiscardPile(
      props.discard.map((tile) => {
        return (
          <div className='tile-wrapper'>
            <Tile suit={tile.suit} value={tile.value} />
          </div>
        );
      })
    );
  }, [props.discard]);

  return <div>{discardPile}</div>;
}
