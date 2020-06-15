import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import SidePanel from './components/SidePanel';

const SIDE_PANEL_WIDTH = 375;

const useStyles = makeStyles({
    // Prevent vh unit from ignoring horizontal scrollbar.
    frame: {
        height: "100vh",
        overflowY: "auto"
    },
    window: {
        height: '100%',
        width: '100vw',
        minWidth: 1280 + SIDE_PANEL_WIDTH,

        // Adjust radial gradient with side panel offset.
        background: `radial-gradient(circle at calc(100% - ${SIDE_PANEL_WIDTH}px - (100% - ${SIDE_PANEL_WIDTH}px) / 2) center, rgb(2, 228, 34) 0%, rgb(9, 121, 86) 100%)`
    },
    panel: {
        width: SIDE_PANEL_WIDTH
    },
    "@global": {
        ".bgio-client": {
            height: "100%"
        }
    },
});

export default function BGIOClient({ room, self, game, board }) {
    // Memoize the game client so every player doesn't reconnect when props are updated.
    const GameClient = useMemo(() => Client({
        game,
        board,
        multiplayer: SocketIO({ server: `${window.location.hostname}:${process.env.REACT_APP_BGIO_PROXY_PORT}` }),
        numPlayers: room.ctx.settings.numPlayers
    }), []);
    const gameID = process.env.NODE_ENV === 'production' ? room.state.gameID : null;
    const classes = useStyles();

    if (self) {
        const { id, name, credentials } = room.state.players[self.id];

        return (
            <div className={classes.frame}>
                <Box className={classes.window} display="flex">
                    <Box flexGrow={1}>
                        <GameClient gameID={gameID} playerID={id} credentials={credentials} />
                    </Box>
                    <SidePanel
                        className={classes.panel}
                        game={room.ctx.id}
                        chatState={room.ctx.chat.map(log => ({ ...log, name: room.ctx.players[log.userID].name }))}
                    />
                </Box>
            </div >
        );
    } else {
        return null;
    }
}