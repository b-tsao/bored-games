import React, {useState, useEffect, useContext} from 'react';
import {Redirect} from 'react-router-dom';
import deepExtend from 'deep-extend';

import MessageModal from '../MessageModal';

import LoadingRoom from '../LoadingRoom';
import AvalonRoom from '../../avalon/Room';
import AvalonGame from '../../avalon/Game';
import Maintenance from '../Maintenance';

import {ClientContext} from '../../../Contexts';

/**
 * Preload of all 'img' fields in passed in object.
 */
async function preloadImages(settings) {
  if (typeof settings === 'object') {
    const promises = [];
    if (Array.isArray(settings)) {
      for (const element of settings) {
        promises.push(preloadImages(element));
      }
    } else {
      for (const setting in settings) {
        if (setting === 'img' && typeof settings[setting] === 'string') {
          promises.push(new Promise((resolve) => {
            const img = new Image();
            img.src = settings[setting];
            img.onload = () => {
              resolve();
            };
          }));
        } else {
          promises.push(preloadImages(settings[setting]));
        }
      }
    }
    await Promise.all(promises);
  }
}

function getSelf(clientId, players) {
  for (const player of players) {
    if (player.client.id === clientId) {
      return player;
    }
  }
}

export default function GameRoom() {
  const [client, setClient] = useContext(ClientContext);
  
  const [room, setRoom] = React.useState(null);
  const [message, setMessage] = useState({
    status: '',
    text: ''
  });
  
  const handleMessageClose = () => {
    setMessage({status: '', text: ''});
  };
  
  const connectedHandler = () => {
    client.emit('get', (err, room) => {
      if (err) {
        console.error(err);
      } else {
        preloadImages(room.game.settings.static).then(() => {
          setRoom(room);
          client.emit('connected');
        });
      }
    });
  };
  
  useEffect(() => {
    if (room) {
      const messageHandler = message => {
        setMessage({status: message.status, text: message.text});
      };
      
      const changeHandler = roomChanges => {
        setRoom({...deepExtend(room, roomChanges)});
      };
      
      client.on('message', messageHandler);
      client.on('changes', changeHandler);

      return () => {
        client.off('message', messageHandler);
        client.off('changes', changeHandler);
      };
    } else {
      connectedHandler();
    }
  }, [room]);
  
  useEffect(() => {
    client.on('connect', connectedHandler);

    return () => {
      client.off('connect', connectedHandler);
      if (!client.connected) {
        setClient(null);
      }
    };
  }, [client]);
  
  const display = room ? (() => {
    if (room.game.state && room.game.state.phase !== 'end' && window.location.pathname === '/') {
      return <Redirect to='/game' />;
    }
    
    switch (room.game.id) {
      case 'the-resistance-avalon':
        console.log(room);
        if (window.location.pathname === '/game') {
          return <AvalonGame room={room} self={getSelf(client.id, room.game.state.players)} />
        } else {
          return <AvalonRoom room={room} self={getSelf(client.id, room.players)} />
        }
      default:
        return <Maintenance />
    }
  })() : <LoadingRoom />;
  
  return (
    <React.Fragment>
      <MessageModal
        open={!!message.text}
        title={message.status}
        message={message.text}
        onClose={handleMessageClose} />
      {display}
    </React.Fragment>
  );
}