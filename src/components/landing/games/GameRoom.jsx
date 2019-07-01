import React, {useState, useContext} from 'react';

import LoadingRoom from './LoadingRoom';
import AvalonRoom from '../../avalon/Room';
import Maintenance from '../Maintenance';

import {ClientContext} from '../../../Contexts';

export default function GameRoom() {
  const [client, setClient] = useContext(ClientContext);
  
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
    switch (room.game) {
      case 'The Resistance: Avalon':
        return <AvalonRoom settings={room.settings} />
      default:
        return <Maintenance />
    }
  })() : <LoadingRoom />;
  
  return display;
}