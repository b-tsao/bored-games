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

export default function GameRoom() {
  const [client] = useContext(ClientContext);
  
  const [room, setRoom] = React.useState(null);
  const [message, setMessage] = useState({
    status: '',
    text: ''
  });
  
  const handleMessageClose = () => {
    setMessage({status: '', text: ''});
  };
  
  useEffect(() => {
    if (room) {
      const messageHandler = message => {
        setMessage({status: message.status, text: message.text});
      };
      
      const changesHandler = roomChanges => {
        setRoom({...deepExtend(room, roomChanges)});
      };
      
      const secretsHandler = secret => {
        console.log("secrets", secret);
      };
      
      client.on('message', messageHandler);
      client.on('changes', changesHandler);
      client.on('secrets', secretsHandler);

      return () => {
        client.off('message', messageHandler);
        client.off('changes', changesHandler);
        client.off('secrets', secretsHandler);
      };
    } else {
      client.emit('get', (err, room) => {
        if (err) {
          console.error(err);
        } else {
          preloadImages(room.game.settings.static).then(() => {setRoom(room)});
        }
      });
    }
  }, [room]);
  
  const display = room ? (() => {
    if (room.game.state != null && window.location.pathname === '/') {
      return <Redirect to='/game' />;
    }
    
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