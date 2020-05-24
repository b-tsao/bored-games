import { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { Tile } from './Tile';
import constants from './constants';
import React from 'react';

export function PlayerHand(props) {
  const [bonusHand, setBonusHand] = useState([]);
  const [concealedHand, setConcealedHand] = useState([]);
  const [revealedHand, setRevealedHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    console.log('PlayerHand:useEffect:[props.bonus]');

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
    console.log('PlayerHand:useEffect:[props.concealed]');

    setConcealedHand(
      props.concealed.map((set) => {
        console.log(
          new Array(set.length - 1)
            .fill(<div className='tile-wrapper tile-back'></div>)
            .push(
              <div className='tile-wrapper'>
                <Tile suit={set[0].suit} value={set[0].value} />
              </div>
            )
        );
        return new Array(set.length - 1)
          .fill(<div className='tile-wrapper tile-back'></div>)
          .concat(
            new Array(
              (
                <div className='tile-wrapper'>
                  <Tile suit={set[0].suit} value={set[0].value} />
                </div>
              )
            )
          );
      })
    );
  }, [props.concealed]);

  useEffect(() => {
    console.log('PlayerHand:useEffect:[props.revealed]');

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

  // TODO: implement client-side timer
  // useEffect(() => {
  //   if (props.gameStage === constants.GAME_STAGE_CLAIM) {
  //     setTimeout(() => skipTile(), constants.CLAIM_TIME_LIMIT);
  //   }
  // }, [props.gameStage]);

  useEffect(() => {
    console.log('PlayerHand:useEffect:[props.hand,selected]');

    setPlayerHand(
      props.hand.map((tile, index) => {
        return (
          <div
            className={`tile-wrapper ${selected.has(index) ? 'selected' : ''}`}
            onClick={() => selectTile(index)}
          >
            <Tile suit={tile.suit} value={tile.value} />
          </div>
        );
      })
    );
  }, [props.hand, selected]);

  function selectTile(pos) {
    console.log('PlayerHand:selectTile');
    if (props.gameStage === undefined) return;

    // Allow selection only during discard and claim stage.
    if (
      props.gameStage === constants.GAME_STAGE_DISCARD ||
      props.gameStage === constants.GAME_STAGE_DRAW ||
      props.gameStage === constants.GAME_STAGE_CLAIM
    ) {
      let temp = new Set(selected);
      if (selected.has(pos)) {
        temp.delete(pos);
      } else {
        temp.add(pos);
      }
      setSelected(temp);
    }
  }

  function clearSelected() {
    console.log('PlayerHand:clearSelectTiles');
    setSelected(new Set());
  }

  function drawTile() {
    console.log('PlayerHand:skipTile');

    props.gameMoves.drawTile();
  }

  function replaceTile() {
    console.log('PlayerHand:replaceTile');

    props.gameMoves.replaceTile();
  }

  function kongTile() {
    console.log('PlayerHand:kongTile');

    if (selected.size === 1) {
      props.gameMoves.declareKong(selected.values().next().value);
    } else if (selected.size === 4) {
      props.gameMoves.declareKong(Array.from(selected));
    } else {
      console.log('Cannot kong with', selected.size, 'selected tiles');
    }

    clearSelected();
  }

  function discardTile() {
    console.log('PlayerHand:discardTile');

    if (selected.size !== 1) return;

    let pos = selected.values().next().value;
    props.gameMoves.discardTile(pos);
    clearSelected();
  }

  function claimTile() {
    console.log('PlayerHand:claimTile');

    props.gameMoves.claimTile(Array.from(selected));
    clearSelected();
  }

  function skipTile() {
    console.log('PlayerHand:skipTile');

    props.gameMoves.skipTile();
    clearSelected();
  }

  function claimVictory() {
    console.log('PlayerHand:claimVictory');

    if (props.gameStage === constants.GAME_STAGE_DISCARD) {
      props.gameMoves.claimVictory();
    } else if (props.gameStage === constants.GAME_STAGE_CLAIM) {
      props.gameMoves.claimTile([]);
    }
    clearSelected();
  }

  return (
    <div className='player-hand'>
      <div className='exposed'>
        <div className='bonus'>{bonusHand}</div>
        <div className='concealed'>{concealedHand}</div>
        <div className='revealed'>{revealedHand}</div>
      </div>
      <div className='hand'>{playerHand}</div>
      <div className='actions'>
        {props.gameStage === constants.GAME_STAGE_DRAW && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => drawTile()}>
              Draw
            </Button>
          </div>
        )}
        {props.gameStage === constants.GAME_STAGE_REPLACE && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => replaceTile()}>
              Draw From End
            </Button>
          </div>
        )}
        {props.gameStage === constants.GAME_STAGE_DISCARD && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => discardTile()}>
              Discard
            </Button>
          </div>
        )}
        {props.gameStage === constants.GAME_STAGE_DISCARD && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => kongTile()}>
              Kong
            </Button>
          </div>
        )}
        {(props.gameStage === constants.GAME_STAGE_DRAW ||
          props.gameStage === constants.GAME_STAGE_CLAIM) && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => claimTile()}>
              Claim
            </Button>
          </div>
        )}
        {props.gameStage === constants.GAME_STAGE_CLAIM && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => skipTile()}>
              Skip
            </Button>
          </div>
        )}
        {(props.gameStage === constants.GAME_STAGE_DISCARD ||
          props.gameStage === constants.GAME_STAGE_CLAIM) && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => claimVictory()}>
              Win
            </Button>
          </div>
        )}
        {(props.gameStage === constants.GAME_STAGE_DISCARD ||
          props.gameStage === constants.GAME_STAGE_CLAIM) && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => clearSelected()}>
              Clear
            </Button>
          </div>
        )}
        {(props.gamePhase === 'break' && props.isActive) && (
          <div className='action-btn'>
            <Button variant='contained' onClick={() => skipTile()}>
              Ready
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
