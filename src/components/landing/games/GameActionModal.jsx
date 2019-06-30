import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Tooltip,
  Typography
} from '@material-ui/core';
import {
  Send as CreateIcon
} from '@material-ui/icons';
import LoadingModal from './LoadingModal';

import {ClientContext} from '../../../Contexts';

const useStyles = makeStyles(theme => ({
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
  const [client, setClient] = useContext(ClientContext);
  
  const [disableClose, setDisableClose] = useState(false);
  const [loading, setLoading] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const classes = useStyles();
  
  const handleOpen = () => {
    setDisableClose(false);
  }
  
  const handleClose = () => {
    props.setGame(null);
  };
  
  const handleCreate = () => {
    setLoading(true);
    setLoadingMessage("Hello World");
    
    const client = socketIOClient('/room');
    client.emit('create', {game: props.game.title}, (err, resp) => {
      if (err) {
        console.error(err);
      } else {
        console.log(resp);
      }
    });
    
    setClient(client);
  };
  
  const handleCreateClose = () => {
    setLoading(false);
    console.log('create closed');
  }
  
  let loadingModal = loading ?
      <LoadingModal
        open={loading}
        title="Creating Game"
        message={loadingMessage}
        handleClose={handleCreateClose} /> : null;
  
  return (
    <div>
      {loadingModal}
      <Dialog
        open={!!props.game}
        disableBackdropClick={disableClose}
        disableEscapeKeyDown={disableClose}
        onEnter={handleOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
        <DialogContent>
          <div className={classes.card}>
            {props.game ? props.game.gameCard : null}
          </div>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Create Game" placement="top">
            <Button
              id="create"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={disableClose}
              onClick={handleCreate}>
              Create
              <CreateIcon className={classes.buttonIcon} />
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </div>
  );
}

GameActionModal.propTypes = {
  game: PropTypes.object,
  setGame: PropTypes.func.isRequired
}