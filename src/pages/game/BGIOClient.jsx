import React, { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

export default function BGIOClient({ room, self, game, board }) {
    const GameClient = useMemo(() => Client({
        game,
        board,
        multiplayer: SocketIO({ server: `${window.location.hostname}:8000` })
    }), []);
    const gameID = room.ctx.gameID;
    const { id, name, credentials } = room.state.players[self.id];

    return <GameClient gameID={gameID} playerID={id} credentials={credentials} debug={false} />
}