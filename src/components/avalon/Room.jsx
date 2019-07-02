import React, {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

import {
  Button,
} from '@material-ui/core';
import NameModal from '../../components/landing/games/NameModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

const names = ["Brian", "Ryan", "Curtis", "Wei", "Raymond", "Tony", "Casey"];

export default function Room(props) {
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [settings, setSettings] = useState(props.settings);
  const [openNameModal, setOpenNameModal] = useState(false);
  
  const setPlayerName = (name) => {
    if (name.length === 0) {
      return "P13@$3 3nt3r y0ur n&m3 y0u i1l!t3r@t3 f*#%";
    } else {
      return "Not implemented yet";
    }
  };
  
  const handleJoin = () => {
    setOpenNameModal(true);
  }
  
  const handleNameModalClose = () => {
    setOpenNameModal(false);
  };
  
  const handleExit = () => {
    client.disconnect();
    setClient(null);
    setMainDisplay('home');
  }
  
  return (
    <div>
      <NameModal
        open={openNameModal}
        handleSubmit={setPlayerName}
        handleClose={handleNameModalClose} />
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
        color="primary"
        onClick={handleExit}>
        Exit
      </Button>
      <Button
        id="join"
        variant="contained"
        color="primary"
        style={{marginLeft: '10px'}}
        onClick={handleJoin}>
        Join
      </Button>
    </div>
  );
}

Room.propTypes = {
  settings: PropTypes.object.isRequired
}