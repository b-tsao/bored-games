import React, {useState, useContext} from 'react';
import PropTypes from 'prop-types';

import {
  Fab,
  Zoom
} from '@material-ui/core';
import JoinGameModal from './JoinGameModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

export default function FloatingActions(props) {
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [openJoinModal, setOpenJoinModal] = useState(false);
  
  const handleJoinGame = () => {
    setOpenJoinModal(true);
  };
  
  const handleJoin = (key) => {
    return "Not implemented yet";
  };
  
  const handleJoinModalClose = () => {
    setOpenJoinModal(false);
  };
  
  return (
    <div>
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