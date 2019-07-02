import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';

import {
  Fab,
  Zoom
} from '@material-ui/core';
import JoinGameModal from './JoinGameModal';
import ProgressModal from './games/ProgressModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

export default function FloatingActions(props) {
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [progress, setProgress] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  
  const handleJoinGame = () => {
    setOpenJoinModal(true);
  };
  
  const handleJoin = (key, callback) => {
    setProgress(true);
    setProgressStatus('connecting');
    setShowProgress(true);
    setProgressMessage("Establishing connection");
    
    const client = socketIOClient('/room');
    
    client.emit('joinRoom', key);
    
    client.on('joinRoom', (data) => {
      setProgressStatus(data.status);
      if (data.status === 'error') {
        setShowProgress(false);
        setProgressMessage(data.message);
      } else if (data.status === 'complete') {
        setClient(client);
        setMainDisplay('gameroom');
        setProgress(false);
      } else {
        setProgressMessage(data.message);
      }
    });
  };
  
  const handleJoinModalClose = () => {
    setOpenJoinModal(false);
  };
  
  const handleJoinClose = () => {
    if (progressStatus === 'error') {
      setProgress(false);
      setOpenJoinModal(true);
    }
  }
  
  let progressModal = progress ?
    <ProgressModal
      open={progress}
      status={progressStatus}
      message={progressMessage}
      showProgress={showProgress}
      handleClose={handleJoinClose} /> : null;
  
  return (
    <div>
      {progressModal}
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