import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { applyPatches } from "immer";

import MessageModal from '../components/MessageModal';

import LoadingRoom from '../LoadingRoom';

import Game from './Game';
import Room from './Room';

import { ClientContext, MainDisplayContext } from '../../Contexts';

/**
 * Preload of all 'img' fields in passed in object.
 */
async function preloadImages(settings) {
  if (typeof settings === 'object') {
    const promises: any[] = [];
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
  for (const id in players) {
    if (players[id].client.id === clientId) {
      return { id, ...players[id] };
    }
  }
  return null;
}

export default function GameRoom() {
  const [client] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);

  const [room, setRoom]: [any, (...args: any[]) => any] = React.useState(null);
  const [message, setMessage] = useState({
    status: '',
    text: ''
  });

  const handleMessageClose = () => {
    setMessage({ status: '', text: '' });
  };

  useEffect(() => {
    if (client) {
      const roomHandler = (ctx, state) => {
        preloadImages(ctx.settings.static).then(() => {
          setRoom({ ctx, state });
        });
      };

      const patchHandler = (ctxPatches, statePatches) => {
        console.log("ctxPatches", ctxPatches);
        console.log("statePatches", statePatches);

        if (ctxPatches) {
          room.ctx = applyPatches(room.ctx, ctxPatches);
        }
        if (statePatches) {
          room.state = applyPatches(room.state, statePatches);
        }

        setRoom({ ...room });
      };

      client.on('room', roomHandler);
      client.on('changes', patchHandler);

      return () => {
        client.off('room', roomHandler);
        client.off('changes', patchHandler)
      };
    }
  }, [room]);

  useEffect(() => {
    const setCookieHandler = cookie => {
      document.cookie = cookie;
    };

    const connectedHandler = () => {
      client.emit('connected');
    };

    const messageHandler = message => {
      setMessage({ status: message.status, text: message.text });
    };

    if (client) {
      client.on('setCookie', setCookieHandler);
      client.on('connect', connectedHandler);
      client.on('message', messageHandler);
      connectedHandler();
    } else {
      setCookieHandler('userId=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
      setCookieHandler('roomKey=;expires=Thu, 01 Jan 1970 00:00:01 GMT;');
      setMainDisplay('home');
    }

    return () => {
      if (client) {
        client.off('setCookie', setCookieHandler);
        client.off('connect', connectedHandler);
        client.off('message', messageHandler);
      }
    };
  }, [client]);

  let display = <LoadingRoom />;

  if (room) {
    console.log("room", room);
    const self = client ? getSelf(client.id, room.ctx.players) : null;
    console.log("self", self);

    if (room.ctx.inProgress && self) {
      if (window.location.pathname === '/') {
        display = <Redirect to='/game' />;
      } else {
        display = <Game room={room} self={self} />;
      }
    } else {
      display = <Room room={room} self={self} />;
    }
  }

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