import React from "react";
import { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Box, Button, Tooltip, Typography } from "@material-ui/core";

import constants from "../constants.json";
import { Tile } from "./Tile";
import { TileBack } from "./TileBack";
import { TILE_HEIGHT_PX, TILE_HEIGHT_LARGE_PX } from "./constants";

const useStyles = makeStyles({
    root: {},
    exposedRow: {
        height: TILE_HEIGHT_PX,
    },
    handRow: {
        height: TILE_HEIGHT_LARGE_PX,
    },
    buttonRow: {
        height: 40,
        "& button": {
            marginRight: "1em",
        },
    },
    selected: {
        opacity: 0.5,
    },
    winButton: {
        background: "rgba(200,200,0,1)",
    },
});

/**
 * Player's hand in three row format.
 * @param {string} props.gamePhase - From boardgame.io - props.ctx.phase
 * @param {object} props.gameMoves - From boardgame.io - props.moves
 * @param {string} props.gameStage - From boardgame.io - props.ctx.activePlayers[id]
 * @param {boolean} props.isActive - From boardgame.io - props.isActive
 * @param {object} props.hand - Object representing player's hand.
 * @param {array} props.hand.bonus - List of bonus tiles.
 * @param {array} props.hand.concealed - List of concealed groups.
 * @param {array} props.hand.hand - List of tiles in hand.
 * @param {array} props.hand.revealed - List of revealed groups.
 */
export function PlayerHand(props) {
    const classes = useStyles(props);

    const [bonus, setBonus] = useState([]);
    const [concealed, setConcealed] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [hand, setHand] = useState([]);

    // Indices of selected tiles.
    const [selected, setSelected] = useState(new Set());

    const claimBtn = (
        <Button
            variant="contained"
            color="primary"
            key="claim"
            onClick={() => claimTile()}
        >
            Claim
        </Button>
    );
    const discardBtn = (
        <Button
            variant="contained"
            color="secondary"
            key="discard"
            onClick={() => discardTile()}
        >
            Discard
        </Button>
    );
    const drawBtn = (
        <Button variant="contained" color="primary" key="draw" onClick={() => drawTile()}>
            Draw
        </Button>
    );
    const drawEndBtn = (
        <Button
            variant="contained"
            color="primary"
            key="drawEnd"
            onClick={() => replaceTile()}
        >
            Draw From End
        </Button>
    );
    const kongBtn = (
        <Button variant="contained" color="primary" key="kong" onClick={() => kongTile()}>
            Kong
        </Button>
    );
    const skipBtn = (
        <Button variant="contained" key="skip" onClick={() => skipTile()}>
            Skip
        </Button>
    );
    const winBtn = (
        <Button
            variant="contained"
            key="win"
            className={classes.winButton}
            onClick={() => claimVictory()}
        >
            Win
        </Button>
    );
    const readyBtn = (
        <Button
            variant="contained"
            color="primary"
            key="ready"
            onClick={() => skipTile()}
        >
            Ready
        </Button>
    );

    /**
     * Get list of action buttons depending on game phase and stage.
     */
    function getActionButtons() {
        // After round ends, show ready button for players to start next round.
        if (props.gamePhase === constants.PHASES.break) {
            if (props.isActive) {
                return [readyBtn];
            } else {
                return (
                    <Typography variant="h6">
                        You are ready for the next round. Waiting for other players...
                    </Typography>
                );
            }
        }

        // Action buttons during stages.
        switch (props.gameStage) {
            case constants.STAGES.claim:
                return [claimBtn, skipBtn, winBtn];
            case constants.STAGES.discard:
                return [discardBtn, kongBtn, winBtn];
            case constants.STAGES.draw:
                return [drawBtn, claimBtn];
            case constants.STAGES.replace:
                return [drawEndBtn];
            default:
                return [];
        }
    }

    /**
     * GAME MOVE: Claim tile with selected tiles.
     */
    function claimTile() {
        if (selected.size < 1) {
            // TODO: show error on UI
            console.log("Need to select tiles to use in claim");
            return;
        }

        props.gameMoves.claimTile(Array.from(selected));
        clearSelected();
    }

    /**
     * GAME MOVE: Claim victory from discard or hand.
     */
    function claimVictory() {
        if (props.gameStage === constants.STAGES.claim) {
            // Winning tile from dicard.
            props.gameMoves.claimTile([]);
        } else if (props.gameStage === constants.STAGES.discard) {
            // Winning tile in hand.
            props.gameMoves.claimVictory();
        }
        clearSelected();
    }

    /**
     * Clear selected tiles.
     */
    function clearSelected() {
        setSelected(new Set());
    }

    /**
     * GAME MOVE: Draw tile.
     */
    function drawTile() {
        props.gameMoves.drawTile();
    }

    /**
     * GAME MOVE: Discard tile.
     */
    function discardTile() {
        if (selected.size !== 1) {
            // TODO: show error on UI
            console.log("Need to select one tile to discard");
            return;
        }

        props.gameMoves.discardTile(selected.values().next().value);
        clearSelected();
    }

    /**
     * GAME MOVE: Perform kong from discard or hand.
     */
    function kongTile() {
        if (selected.size === 1) {
            props.gameMoves.declareKong(selected.values().next().value);
        } else if (selected.size === 4) {
            props.gameMoves.declareKong(Array.from(selected));
        } else {
            // TODO: show error on UI
            console.log("Cannot kong with", selected.size, "selected tiles");
        }

        clearSelected();
    }

    /**
     * GAME MOVE: Draw tile from end of wall.
     */
    function replaceTile() {
        props.gameMoves.replaceTile();
    }

    /**
     * GAME MOVE: Skip tile for claims. Also used for readying next round.
     */
    function skipTile() {
        props.gameMoves.skipTile();
        clearSelected();
    }

    useEffect(() => {
        setBonus(
            props.hand.bonus.map((tile) => {
                return (
                    <Box key={tile.suit + tile.value}>
                        <Tile suit={tile.suit} value={tile.value} />
                    </Box>
                );
            })
        );
    }, [props.hand.bonus]);

    useEffect(() => {
        setConcealed(
            props.hand.concealed.map((set, setIndex) => {
                // List of tiles to show on tooltip.
                let listOfTiles = set.map((tile, tileIndex) => {
                    return (
                        <Box key={tileIndex + tile.suit + tile.value}>
                            <Tile suit={tile.suit} value={tile.value} />
                        </Box>
                    );
                });
                // List of back of tiles to show on exposed row.
                let listofTileBack = set.map((_, tileIndex) => {
                    return (
                        <Box key={tileIndex}>
                            <TileBack />
                        </Box>
                    );
                });
                return (
                    <Box key={setIndex}>
                        <Tooltip
                            arrow={true}
                            placement="top"
                            title={<Box display="flex">{listOfTiles}</Box>}
                        >
                            <Box display="flex">
                                {listofTileBack}
                            </Box>
                        </Tooltip>
                    </Box>
                );
            })
        );
    }, [props.hand.concealed]);

    useEffect(() => {
        setRevealed(
            props.hand.revealed.map((set, setIndex) => {
                return set.map((tile, tileIndex) => {
                    return (
                        <Box key={setIndex + tileIndex + tile.suit + tile.value}>
                            <Tile suit={tile.suit} value={tile.value} />
                        </Box>
                    );
                });
            })
        );
    }, [props.hand.revealed]);

    useEffect(() => {
        /**
         * Select a tile in your hand.
         * @param {integer} position index of tile selected
         */
        function selectTile(position) {
            if (
                props.gameStage === constants.STAGES.claim ||
                props.gameStage === constants.STAGES.discard ||
                props.gameStage === constants.STAGES.draw
            ) {
                let temp = new Set(selected);
                if (selected.has(position)) {
                    temp.delete(position);
                } else {
                    temp.add(position);
                }
                setSelected(temp);
            }
        }

        setHand(
            props.hand.hand.map((tile, tileIndex) => {
                return (
                    <Box
                        key={tileIndex}
                        className={selected.has(tileIndex) ? classes.selected : ""}
                        onClick={() => selectTile(tileIndex)}
                    >
                        <Tile suit={tile.suit} value={tile.value} large={true} />
                    </Box>
                );
            })
        );
    }, [classes.selected, props.gameStage, props.hand.hand, selected]);

    return (
        <Box display="flex" alignItems="flex-start" className={classes.root}>
            <Box display="flex" flexDirection="column">
                <Box display="flex" className={classes.exposedRow}>
                    {bonus}
                    {concealed}
                    {revealed}
                </Box>
                <Box display="flex" mt={1} className={classes.handRow}>
                    {hand}
                </Box>
                <Box display="flex" mt={2} className={classes.buttonRow}>
                    {getActionButtons()}
                </Box>
            </Box>
        </Box>
    );
}
