import { useEffect, useState } from 'react';
import { Tile } from './Tile';
import React from 'react';

export function OpponentHand(props) {
  const [bonusHand, setBonusHand] = useState([]);
  const [concealedHand, setConcealedHand] = useState([]);
  const [revealedHand, setRevealedHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);

  useEffect(() => {
    setBonusHand(
      props.bonus.map((tile) => {
        return (
          <div className='tile-wrapper'>
            <Tile suit={tile.suit} value={tile.value} />
          </div>
        );
      })
    );
  }, [props.bonus]);

  useEffect(() => {
    setConcealedHand(
      props.concealed.map((set) => {
        if (set === 'kong') {
          return new Array(4).fill(
            <div className='tile-wrapper tile-back'></div>
          );
        }
      })
    );
  }, [props.concealed]);

  useEffect(() => {
    setRevealedHand(
      props.revealed.map((set) => {
        return set.map((tile) => {
          return (
            <div className='tile-wrapper'>
              <Tile suit={tile.suit} value={tile.value} />
            </div>
          );
        });
      })
    );
  }, [props.revealed]);

  useEffect(() => {
    setOpponentHand(
      new Array(props.hand).fill(<div className='tile-wrapper tile-back'></div>)
    );
  }, [props.hand]);

  return (
    <div className='opponent-hand'>
      <div className='exposed'>
        <div className='bonus'>{bonusHand}</div>
        <div className='concealed'>{concealedHand}</div>
        <div className='revealed'>{revealedHand}</div>
      </div>
      <div className='hand'>{opponentHand}</div>
    </div>
  );
}
