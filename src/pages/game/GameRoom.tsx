import React, { useEffect, useContext } from 'react';
import {
  Redirect,
  useHistory,
  useParams,
  useRouteMatch
} from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { applyPatches } from 'immer';

import LoadingRoom from '../LoadingRoom';

import Game from './Game';
import Room from './Room';

import { ClientContext, MessageContext } from '../../Contexts';

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
            img.onerror = () => {
              delete settings.img;
              resolve();
            }
          }));
        } else {
          promises.push(preloadImages(settings[setting]));
        }
      }
    }
    await Promise.all(promises);
  }
}

function getPlayer(players, clientId) {
  for (const id in players) {
    if (players[id].client.id === clientId) {
      return { id, ...players[id] };
    }
  }
  return null;
}

export default function GameRoom() {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { id } = useParams(); // retrieve project id from path

  const [client, setClient] = useContext(ClientContext);
  const setMessage = useContext(MessageContext);

  const [room, setRoom]: [any, (...args: any[]) => any] = React.useState(null);

  useEffect(() => {
    if (client) {
      if (client.connected) {
        client.emit('connected', id);
      } else {
        client.connect();
      }
    } else {
      const newClient: any = socketIOClient('/room');
      newClient.roomKey = id;
      setClient(newClient);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (client) {
      const connectedHandler = () => {
        client.emit('connected', id);
      };

      const disconnectHandler = (reason: string) => {
        console.log(reason, client);
        if (reason === 'io server disconnect') {
          setClient(null);
          history.replace('/');
        }
      };

      const setCookieHandler = cookie => {
        document.cookie = cookie;
      };

      const messageHandler = message => {
        setMessage({ status: message.status, text: message.text });
      };

      const roomHandler = (ctx, state) => {
        preloadImages(ctx.settings.static).then(() => {
          setRoom({ ctx, state });
        });
      };

      client.on('connect', connectedHandler);
      client.on('disconnect', disconnectHandler);
      client.on('setCookie', setCookieHandler);
      client.on('message', messageHandler);

      client.on('room', roomHandler);

      return () => {
        client.off('connect', connectedHandler);
        client.off('disconnect', disconnectHandler);
        client.off('setCookie', setCookieHandler);
        client.off('message', messageHandler);

        client.off('room', roomHandler);

        if (client.disconnected) {
          setCookieHandler('userId=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;');
        }
      };
    }
  }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (room) {
      const patchHandler = (ctxPatches, statePatches) => {
        console.log('ctxPatches', ctxPatches);
        console.log('statePatches', statePatches);

        if (ctxPatches) {
          room.ctx = applyPatches(room.ctx, ctxPatches);
        }
        if (statePatches) {
          room.state = applyPatches(room.state, statePatches);
        }

        setRoom({ ...room });
      };

      client.on('changes', patchHandler);

      return () => {
        client.off('changes', patchHandler)
      };
    }
  }, [room]); // eslint-disable-line react-hooks/exhaustive-deps

  let display = <LoadingRoom />;

  if (room) {
    console.log('room', room);
    const self = client ? getPlayer(room.ctx.players, client.id) : null;
    console.log('self', self);

    if (room.ctx.inProgress) {
      if (window.location.pathname.endsWith('/game')) {
        display = <Game room={room} self={self} />;
      } else {
        display = <Redirect to={`${url}/game`} />;
      }
    } else {
      if (window.location.pathname.endsWith('/game')) {
        display = <Redirect to={url.substring(0, url.length - '/game'.length)} />;
      } else {
        display = <Room room={room} self={self} />;
      }
    }
  }

  return display;
}