import React, {useState, useContext} from 'react';

import LoadingRoom from '../LoadingRoom';
import AvalonRoom from '../../avalon/Room';
import AvalonGame from '../../avalon/Game';
import Maintenance from '../Maintenance';

import {ClientContext} from '../../../Contexts';

export default function GameRoom() {
  const [client] = useContext(ClientContext);
  
  const [room, setRoom] = React.useState(null);
  
  if (!room) {
    client.emit('get', (err, room) => {
      if (err) {
        console.error(err);
      } else {
        setRoom(room);
      }
    });
  }
  
  const display = room ? (() => {
    switch (room.game.title) {
      case 'The Resistance: Avalon':
        if (room.game.state != null && window.location.pathname === '/game') {
          return <AvalonGame room={room} />
        } else {
          return <AvalonRoom room={room} />
        }
      default:
        return <Maintenance />
    }
  })() : <LoadingRoom />;
  
  return display;
}