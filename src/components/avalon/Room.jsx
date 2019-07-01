import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import NameRequestModal from '../../components/landing/NameRequestModal';
import {
  Button,
} from '@material-ui/core';

const names = ["Brian", "Ryan", "Curtis", "Wei", "Raymond", "Tony", "Casey"];

export default function Room(props) {
  const [socket, setSocket] = useState(null);
  
  const setPlayerName = (name, callback) => {
    if (name.length === 0) {
      return callback("P13@$3 3nt3r y0ur n&m3 y0u i1l!t3r@t3 f*#%");
    } else {
      setSocket(socketIOClient('/'));
      return callback();
    }
  };
  
  const handleExit = () => {
    if (socket) {
      socket.disconnect();
    }
  };
  
  window.onpopstate = (e) => {
    handleExit();
  };
  
  return (
    <div>
      <NameRequestModal setName={setPlayerName} />
      <h1>The Resistance: Avalon</h1>

      <p>This is the ghetto waiting room for Avalon while you wait for your friends to join!</p>

      <ul>
        {names.map(function(name, i) {
          return <li key={i}>{name}</li>;
        })}
      </ul>

      <Button
        id="exit"
        variant="contained"
        color="primary">
        Exit
      </Button>
      <Button
        id="join"
        variant="contained"
        color="primary"
        style={{marginLeft: '10px'}}>
        Join
      </Button>
    </div>
  );
}