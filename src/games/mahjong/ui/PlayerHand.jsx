import React from "react";
import { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Box, Button, Typography } from "@material-ui/core";

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
        console.log(selected.size);
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
                return new Array(set.length).fill(<TileBack />);
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
            props.hand.hand.map((tile, index) => {
                return (
                    <Box
                        key={index}
                        className={selected.has(index) ? classes.selected : ""}
                        onClick={() => selectTile(index)}
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
