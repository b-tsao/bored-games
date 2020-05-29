import React from "react";
import { useEffect, useRef, useState } from "react";

import "react-dice-complete/dist/react-dice-complete.css";
import ReactDice from "react-dice-complete";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Button, Grid, Typography } from "@material-ui/core";

import constants from "../constants.json";
import { DiscardPile } from "./DiscardPile";
import { PlayerHand } from "./PlayerHand";
import { PlayerInfoCard } from "./PlayerInfoCard";
import { OpponentHand } from "./OpponentHand";

const useStyles = makeStyles({
  root: {
    height: "100vh",
    minWidth: 1280,
    marginRight: "310px", // TODO: remove when not debugging
    background:
      "radial-gradient(circle, rgba(2, 228, 34, 1) 0%, rgba(9, 121, 86, 1) 100%)",
    "& div": {
      // border: "1px solid black",
    },
  },
  grid: {
    height: "inherit",
  },
  outerColumn: {
    position: "relative",
  },
  innerColumn: {
    display: "flex",
    flexDirection: "column",
  },
  middleWrapper: {
    height: "50%",
    border: "1px solid black",
  },
  topWrapper: {
    height: "20%",
  },
  bottomWrapper: {
    height: "30%",
  },
  diceWrapper: {
    height: "100%",
  },
  // Rotating and aligning the left and right player is such a pain.
  playerLeftHand: {
    minWidth: "fit-content",
    position: "absolute",
    top: "50%",
    left: "100%",
    transform: "translate(-50%, 0%) rotate(90deg)",
    transformOrigin: "center top",
  },
  playerLeftInfo: {
    minWidth: "fit-content",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -100%) rotate(90deg)",
    transformOrigin: "center bottom",
  },
  playerRightHand: {
    minWidth: "fit-content",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, 0%) rotate(-90deg)",
    transformOrigin: "center top",
  },
  playerRightInfo: {
    minWidth: "fit-content",
    position: "absolute",
    top: "50%",
    right: 0,
    transform: "translate(50%,-100%) rotate(-90deg)",
    transformOrigin: "center bottom",
  },
});

// TODO: replace player name and points with metadata
export function MahjongTable(props) {
  const classes = useStyles();

  const playerID = parseInt(props.playerID);
  const playerRightID = (playerID + 1) % props.ctx.numPlayers;
  const playerTopID = (playerID + 2) % props.ctx.numPlayers;
  const playerLeftID = (playerID + 3) % props.ctx.numPlayers;

  const [showDicePhase, setShowDicePhase] = useState(false);
  var reactDice = useRef();

  /**
   * Check if player is the current player.
   * @param {integer} pid player ID
   */
  function isCurrentPlayer(pid) {
    return parseInt(props.ctx.currentPlayer) === pid;
  }

  /**
   * Check if player was the first East in the beginning.
   * @param {integer} pid player ID
   */
  function isDealer(pid) {
    return parseInt(props.ctx.playOrder[0]) === pid;
  }

  /**
   * Get current dice holder of the round.
   * @param {integer} pid player ID
   */
  function isDiceHolder(pid) {
    return props.G.east === pid;
  }

  /**
   * Get player's wind for the round (based on current east).
   * @param {integer} pid player ID
   */
  function getPlayerWind(pid) {
    let windPosition = (pid - props.G.east + 4) % 4;
    return constants.WIND[windPosition];
  }

  /**
   * GAME MOVE: Roll dice with game move.
   */
  function rollDice() {
    props.moves.rollDice();
  }

  /**
   * Callback after dice roll finishes.
   */
  function rollDoneCallback() {
    setTimeout(() => setShowDicePhase(false), 2000);
  }

  useEffect(() => {
    if (props.ctx.phase === constants.PHASES.setup) {
      setShowDicePhase(true);
    }
  }, [props.ctx.phase]);

  useEffect(() => {
    if (showDicePhase && props.G.dice.length > 0) {
      reactDice.rollAll(props.G.dice);
    }
  }, [props.G.dice, showDicePhase]);

  return (
    <Box className={classes.root}>
      <Grid container className={classes.grid}>
        <Grid item xs={2} className={classes.outerColumn}>
          {/* Left Opponent */}
          <Box className={classes.playerLeftInfo}>
            <PlayerInfoCard
              current={isCurrentPlayer(playerLeftID)}
              dealer={isDealer(playerLeftID)}
              dice={isDiceHolder(playerLeftID)}
              name="Player 3"
              points="100.00"
              wind={getPlayerWind(playerLeftID)}
            />
          </Box>
          <Box pt={3} className={classes.playerLeftHand}>
            {!showDicePhase && (
              <OpponentHand seat="left" hand={props.G.players[playerLeftID]} />
            )}
          </Box>
        </Grid>
        <Grid item xs={8} className={classes.innerColumn}>
          {/* Top Opponent */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            className={classes.topWrapper}
          >
            <Box>
              <PlayerInfoCard
                current={isCurrentPlayer(playerTopID)}
                dealer={isDealer(playerTopID)}
                dice={isDiceHolder(playerTopID)}
                name="Player 2"
                points="100.00"
                wind={getPlayerWind(playerTopID)}
              />
            </Box>
            <Box display="flex">
              {!showDicePhase && (
                <OpponentHand seat="top" hand={props.G.players[playerTopID]} />
              )}
            </Box>
          </Box>
          {/* Center - dice, discard, game information */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            p={2}
            className={classes.middleWrapper}
          >
            {/* Discard and dice */}
            {showDicePhase ? (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                className={classes.diceWrapper}
              >
                {props.ctx.phase === constants.PHASES.setup ? (
                  // Show dice for starting player and show waiting text for others.
                  props.ctx.currentPlayer === props.playerID ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => rollDice()}
                    >
                      Roll Dice
                    </Button>
                  ) : (
                    <Typography variant="h4">Waiting for dice roll...</Typography>
                  )
                ) : (
                  <ReactDice
                    numDice={3}
                    faceColor={"#FFFFFF"}
                    dotColor={"#000000"}
                    rollDone={rollDoneCallback}
                    disableIndividual={true}
                    rollTime={1}
                    ref={(dice) => (reactDice = dice)}
                  />
                )}
              </Box>
            ) : (
              <DiscardPile discard={props.G.discard} />
            )}
            {/* Game Information */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box component="div" display="inline" p={1}>
                <Typography>Wind: {props.G.wind}</Typography>
              </Box>
              <Box component="div" display="inline" p={1}>
                {props.ctx.phase === constants.PHASES.break && (
                  <Typography variant="h5">Game Over</Typography>
                )}
              </Box>
              <Box component="div" display="inline" p={1}>
                {!showDicePhase && (
                  <Typography>Tiles Left: {props.G.wall.live}</Typography>
                )}
              </Box>
            </Box>
          </Box>
          {/* Player */}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="flex-start"
            mt={3}
            className={classes.bottomWrapper}
          >
            <Box display="flex">
              {!showDicePhase && (
                <PlayerHand
                  hand={props.G.players[playerID]}
                  gamePhase={props.ctx.phase}
                  gameMoves={props.moves}
                  gameStage={props.ctx.activePlayers && props.ctx.activePlayers[playerID]}
                  isActive={props.isActive}
                />
              )}
            </Box>
            <Box alignSelf="center">
              <PlayerInfoCard
                current={isCurrentPlayer(playerID)}
                dealer={isDealer(playerID)}
                dice={isDiceHolder(playerID)}
                name="Pikachu"
                points="100.00"
                wind={getPlayerWind(playerID)}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={2} className={classes.outerColumn}>
          {/* Right Opponent */}
          <Box className={classes.playerRightInfo}>
            <PlayerInfoCard
              current={isCurrentPlayer(playerRightID)}
              dealer={isDealer(playerRightID)}
              dice={isDiceHolder(playerRightID)}
              name="Player 1"
              points="100.00"
              wind={getPlayerWind(playerRightID)}
            />
          </Box>
          <Box pt={3} className={classes.playerRightHand}>
            {!showDicePhase && (
              <OpponentHand seat="right" hand={props.G.players[playerRightID]} />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
