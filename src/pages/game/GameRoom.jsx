import React, { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { applyPatches } from "immer";

import MessageModal from '../components/MessageModal';

import LoadingRoom from '../LoadingRoom';
import AvalonRoom from '../../games/avalon/ui/Room';
import AvalonGame from '../../games/avalon/ui/Game';
import Maintenance from '../Maintenance';

import Room from './Room';
import BGIOClient from './BGIOClient';

import { MahjongTable } from '../../games/mahjong/ui/MahjongTable';
import { MahjongGame } from '../../games/mahjong/game';

import { ClientContext, MainDisplayContext } from '../../Contexts';

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
  for (const id in players) {
    if (players[id].client.id === clientId) {
      return { id, ...players[id] };
    }
  }
}

export default function GameRoom() {
  const [client] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);

  const [room, setRoom] = React.useState(null);
  const [message, setMessage] = useState({
    status: '',
    text: ''
  });

  const handleMessageClose = () => {
    setMessage({ status: '', text: '' });
  };

  useEffect(() => {
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

  const display = room ? (() => {
    const self = client ? getSelf(client.id, room.ctx.players) : null;
    console.log("self", self)

    if (room.ctx.inProgress && self && window.location.pathname === '/') {
      return <Redirect to='/game' />;
    }

    console.log("room", room);

    switch (room.ctx.id) {
      case 'the-resistance-avalon':
        if (window.location.pathname === '/game') {
          return <AvalonGame room={room} self={self} />
        } else {
          return <AvalonRoom room={room} self={self} />
        }
      case 'mahjong':
        if (window.location.pathname === '/game') {
          return <BGIOClient room={room} self={self} game={MahjongGame} board={MahjongTable} />
        } else {
          return <Room room={room} self={self} />
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