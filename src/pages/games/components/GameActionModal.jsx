import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography
} from '@material-ui/core';
import {
  Send as CreateIcon
} from '@material-ui/icons';
import ConnectModal from '../../components/ConnectModal';

import {
  MainDisplayContext,
  ClientContext
} from '../../../Contexts';

const useStyles = makeStyles(theme => ({
  content: {
    padding: '4px 16px'
  },
  card: {
    marginTop: theme.spacing(2) + 2
  },
  button: {
    margin: theme.spacing(1)
  },
  buttonIcon: {
    marginLeft: theme.spacing(1)
  }
}));

export default function GameActionModal(props) {
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  const [client, setClient] = useContext(ClientContext);

  const [connectState, setConnectState] = useState({
    client: null,
    data: null,
    connect: false
  });

  const classes = useStyles();

  const handleCreate = () => {
    const newClient = socketIOClient('/room');
    setConnectState({
      client: newClient,
      data: props.game.id,
      connect: true
    });
  };

  const handleConnectClose = () => {
    setConnectState({ connect: false });
  };

  const handleComplete = () => {
    setClient(connectState.client);
    setConnectState({ connect: false });
    setMainDisplay('gameroom');
  };

  return (
    <div>
      <ConnectModal
        connect={connectState.connect}
        client={connectState.client}
        event='create'
        data={connectState.data}
        onComplete={handleComplete}
        onClose={handleConnectClose} />
      <Dialog
        open={!!props.game}
        onClose={props.onClose}
        aria-labelledby="form-dialog-title">
        <DialogContent className={classes.content}>
          <div className={classes.card}>
            {props.game ? props.game.gameCard : null}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            id="create"
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={!!client}
            onClick={handleCreate}>
            Create
            <CreateIcon className={classes.buttonIcon} />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

GameActionModal.propTypes = {
  game: PropTypes.object,
  onClose: PropTypes.func
}