import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';

import {
  Fab,
  Zoom
} from '@material-ui/core';
import JoinGameModal from './JoinGameModal';
import ConnectModal from './ConnectModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

export default function FloatingActions(props) {
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [connectState, setConnectState] = useState({
    key: '',
    connect: false
  });
  
  const handleJoinGame = () => {
    setOpenJoinModal(true);
  };
  
  const handleJoin = (key, callback) => {
    setConnectState({
      key,
      connect: true
    });
  };
  
  const handleJoinModalClose = () => {
    setOpenJoinModal(false);
  };
  
  const handleConnectClose = () => {
    setConnectState(prevState => {
      return {...prevState, connect: false};
    });
    setOpenJoinModal(true);
  };
  
  const handleComplete = (client) => {
    setClient(client);
    setConnectState(prevState => {
      return {...prevState, connect: false};
    });
    setMainDisplay('gameroom');
  };
  
  return (
    <div>
      <ConnectModal
        connect={connectState.connect}
        namespace='/room'
        event='joinRoom'
        data={connectState.key}
        onComplete={handleComplete}
        onClose={handleConnectClose} />
      <JoinGameModal
        open={openJoinModal}
        handleJoin={handleJoin}
        handleClose={handleJoinModalClose} />
      <Zoom in={!client}>
        <Fab
          color="primary"
          aria-label="Join"
          variant="extended"
          className={props.className}
          onClick={handleJoinGame}>
          Join Game
        </Fab>
      </Zoom>
    </div>
  );
}

FloatingActions.propTypes = {
  className: PropTypes.string
}