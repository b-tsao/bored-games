import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
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
import ProgressModal from './ProgressModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../../Contexts';

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
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [disableClose, setDisableClose] = useState(false);
  const [progress, setProgress] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [progressStatus, setProgressStatus] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  
  const classes = useStyles();
  
  const handleOpen = () => {
    setDisableClose(false);
  }
  
  const handleClose = () => {
    props.setGame(null);
  };
  
  const handleCreate = () => {
    setProgress(true);
    setProgressStatus('');
    setShowProgress(true);
    setProgressMessage("Establishing connection");
    
    const client = socketIOClient('/room');
    
    client.emit('create', {game: props.game.title});
    
    client.on('create', (data) => {
      setProgressStatus(data.status);
      if (data.status === 'error') {
        setShowProgress(false);
        setProgressMessage(data.message);
      } else if (data.status === 'complete') {
        setClient(client);
        setMainDisplay('gameroom');
      } else {
        setProgressMessage(data.message);
      }
    });
  };
  
  const handleCreateClose = () => {
    if (progressStatus === 'error') {
      setProgress(false);
    }
  }
  
  let progressModal = progress ?
      <ProgressModal
        title="Create Game"
        open={progress}
        status={progressStatus}
        message={progressMessage}
        showProgress={showProgress}
        handleClose={handleCreateClose} /> : null;
  
  return (
    <div>
      {progressModal}
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
  setGame: PropTypes.func.isRequired
}