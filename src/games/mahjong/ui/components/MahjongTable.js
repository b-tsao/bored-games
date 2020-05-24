import './MahjongTable.css';
import 'react-dice-complete/dist/react-dice-complete.css';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@material-ui/core';
import { DiscardPile } from './DiscardPile';
import { OpponentHand } from './OpponentHand';
import { PlayerHand } from './PlayerHand';
import constants from './constants';
import React from 'react';
import ReactDice from 'react-dice-complete';

// TODO: name for players (from parent)
// TODO: show stage and stats
// TODO: add claim messages
// TODO: add claim timers UI
// TODO: allow player to claim if its their turn and haven't drawn
// TODO: Warning: Each child in a list should have a unique "key" prop.
// TODO: separate exposed groups
// TODO: animation and sound
// TODO: top player - switch concealed and revealed

export function MahjongTable(props) {
  const playerRightID = (parseInt(props.playerID) + 1) % props.ctx.numPlayers;
  const playerTopID = (parseInt(props.playerID) + 2) % props.ctx.numPlayers;
  const playerLeftID = (parseInt(props.playerID) + 3) % props.ctx.numPlayers;

  const [showDice, setShowDice] = useState(
    props.ctx.phase === constants.GAME_PHASE_SETUP
  );
  var reactDice = useRef();
  const [activePlayers, setActivePlayers] = useState(null);

  function rollDice() {
    props.moves.rollDice();
  }

  function rollDoneCallback() {
    setTimeout(() => setShowDice(false), 2000);
  }

  useEffect(() => {
    if (showDice && props.G.dice.length > 0) {
      reactDice.rollAll(props.G.dice);
    }
  }, [props.G.dice]);

  useEffect(() => {
    if (props.gameMetadata && props.ctx.activePlayers !== null) {
      let temp = [];
      for (let pid in props.ctx.activePlayers) {
        temp.push(
          <div>
            {/* Note: This won't work locally because gameMetadata comes from the Lobby. */}
            Waiting for {props.gameMetadata[pid].name} to{' '}
            {props.ctx.activePlayers[pid]}
          </div>
        );
      }
      setActivePlayers(temp);
    }
  }, [props.ctx.activePlayers]);

  return (
    <div className='mj-table'>
      {showDice ? (
        // Roll dice phase.
        <div className='mj-dice'>
          {props.ctx.phase === constants.GAME_PHASE_SETUP ? (
            props.playerID === props.ctx.currentPlayer ? (
              <Button
                variant='contained'
                size='large'
                onClick={() => rollDice()}
              >
                Roll Dice
              </Button>
            ) : (
                <h1>Waiting for dice roll...</h1>
              )
          ) : (
              <ReactDice
                numDice={3}
                faceColor={'#FFFFFF'}
                dotColor={'#000000'}
                rollDone={rollDoneCallback}
                disableIndividual={true}
                rollTime={1}
                ref={(dice) => (reactDice = dice)}
              />
            )}
        </div>
      ) : (
          // Play game phase.
          <div className='mj-grid'>
            {/* This is a simple way to show player's name. Will improve UI when refactoring with Material UI.*/}
            {/* Note: This won't work locally because gameMetadata comes from the Lobby. */}
            {props.gameMetadata ?
              <div className='top-left'>
                You are {props.gameMetadata[props.playerID].name}
                <br />
                <br />
            East = {props.gameMetadata[props.G.east].name}
                <br />
            South = {props.gameMetadata[(props.G.east + 1) % props.ctx.numPlayers].name}
                <br />
            West = {props.gameMetadata[(props.G.east + 2) % props.ctx.numPlayers].name}
                <br />
            North = {props.gameMetadata[(props.G.east + 3) % props.ctx.numPlayers].name}
              </div>
              : null}
            <div className='top-right'>
              Wind = {props.G.wind}
              <br />
              Tiles Left: {props.G.wall.live}
              <br />
              <br />
              {activePlayers}
            </div>
            <div className='bottom'>
              <PlayerHand
                bonus={props.G.players[props.playerID].bonus}
                concealed={props.G.players[props.playerID].concealed}
                hand={props.G.players[props.playerID].hand}
                revealed={props.G.players[props.playerID].revealed}
                gameMoves={props.moves}
                gameStage={props.ctx.activePlayers && props.ctx.activePlayers[props.playerID]}
                gamePhase={props.ctx.phase}
                isActive={props.isActive}
              />
            </div>
            <div className='right'>
              <OpponentHand
                bonus={props.G.players[playerRightID].bonus}
                concealed={props.G.players[playerRightID].concealed}
                hand={props.G.players[playerRightID].hand}
                revealed={props.G.players[playerRightID].revealed}
              />
            </div>
            <div className='top'>
              <OpponentHand
                bonus={props.G.players[playerTopID].bonus}
                concealed={props.G.players[playerTopID].concealed}
                hand={props.G.players[playerTopID].hand}
                revealed={props.G.players[playerTopID].revealed}
              />
            </div>
            <div className='left'>
              <OpponentHand
                bonus={props.G.players[playerLeftID].bonus}
                concealed={props.G.players[playerLeftID].concealed}
                hand={props.G.players[playerLeftID].hand}
                revealed={props.G.players[playerLeftID].revealed}
              />
            </div>
            {/* I know it's ugly, but I don't want to spend too much time on this since the layout will be revamped later */}
            <div
              className={
                'middle ' +
                (props.ctx.currentPlayer == props.playerID
                  ? 'current-bottom'
                  : props.ctx.currentPlayer == playerRightID
                    ? 'current-right'
                    : props.ctx.currentPlayer == playerTopID
                      ? 'current-top'
                      : props.ctx.currentPlayer == playerLeftID
                        ? 'current-left'
                        : '')
              }
            >
              <DiscardPile discard={props.G.discard} />
            </div>
          </div>
        )}
    </div>
  );
}
