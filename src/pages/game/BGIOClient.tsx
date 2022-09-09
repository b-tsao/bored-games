import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import { ClientContext } from '../../Contexts';

// const SIDE_PANEL_WIDTH = 375;
const SIDE_PANEL_WIDTH = 0;

const useStyles = makeStyles({
    // Prevent vh unit from ignoring horizontal scrollbar.
    frame: {
        height: "100vh",
        overflowY: "auto"
    },
    window: {
        height: '100%',
        width: '100vw',
        // minWidth: 1280 + SIDE_PANEL_WIDTH
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
    const [client] = useContext(ClientContext);

    useEffect(() => {
        if (client) {
            // When socket io reconnects, server emits setCookie to client, we will use a hack to reconnect BGIO as well when we listen for this event
            // for devices that go to sleep and wakes up
            const reconnectBgioHandler = () => {
                window.location.reload();
            };

            client.on('setCookie', reconnectBgioHandler);

            return () => {
                client.off('setCookie', reconnectBgioHandler);
            };
        }
    }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

    // Memoize the game client so every player doesn't reconnect when props are updated.
    const GameClient = useMemo(() => Client({
        game,
        board,
        multiplayer: SocketIO({ server: `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_BGIO_PROXY_PORT}`, socketOpts: { reconnection: false } }),
        numPlayers: room.ctx.settings.numPlayers
    }), []); // eslint-disable-line react-hooks/exhaustive-deps

    const { matchID } = room.state;
    const classes = useStyles();

    if (self) {
        const { id, name, credentials } = room.state.players[self.id];

        return (
            <div className={classes.frame}>
                <Box className={classes.window} display="flex">
                    <Box flexGrow={1}>
                        <GameClient matchID={matchID} playerID={id} credentials={credentials} />
                    </Box>
                    {/* <SidePanel
                        className={classes.panel}
                        game={room.ctx.id}
                        chatState={room.ctx.chat.map(log => ({ ...log, name: room.ctx.players[log.userID].name }))}
                    /> */}
                </Box>
            </div >
        );
    } else {
        return (
            <div className={classes.frame}>
                <Box className={classes.window} display="flex">
                    <Box flexGrow={1}>
                        <GameClient matchID={matchID} />
                    </Box>
                </Box>
            </div >
        );
    }
}