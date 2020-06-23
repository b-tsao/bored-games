import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

export default function BGIOClient({ room, self, game, board }) {
    // Memoize the game client so every player doesn't reconnect when props are updated.
    const GameClient = useMemo(() => Client({
        game,
        board,
        multiplayer: SocketIO({ server: `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_BGIO_PROXY_PORT}` }),
        numPlayers: room.ctx.settings.numPlayers
    }), []); // eslint-disable-line react-hooks/exhaustive-deps
    const gameID = process.env.NODE_ENV === 'production' ? room.state.gameID : null;
    if (self) {
        const { id, name, credentials } = room.state.players[self.id];

        return <GameClient gameID={gameID} playerID={id} credentials={credentials} />
    } else {
        return null;
    }
}