import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

export default function BGIOClient({ room, self, game, board }) {
    // Memoize the game client so every player doesn't reconnect when props are updated.
    const GameClient = useMemo(() => Client({
        game,
        board,
        multiplayer: SocketIO({ server: `${window.location.origin}:8443` })
    }), []);
    const gameID = room.ctx.gameID;
    if (self) {
        const { id, name, credentials } = room.state.players[self.id];

        return <GameClient gameID={gameID} playerID={id} credentials={credentials} />
    } else {
        return null;
    }
}