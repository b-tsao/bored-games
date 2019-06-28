import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Tooltip,
  Typography
} from '@material-ui/core';
import {
  Send as CreateIcon
} from '@material-ui/icons';

import {SocketContext} from '../../../Contexts';

const useStyles = makeStyles(theme => ({
  card: {
    maginTop: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(2) + 2
    }
  },
  button: {
    margin: theme.spacing(1)
  },
  buttonIcon: {
    marginLeft: theme.spacing(1)
  }
}));

export default function GameActionModal(props) {
  const [socket, setSocket] = useContext(SocketContext);
  
  const [disableClose, setDisableClose] = useState(false);
  
  const classes = useStyles();
  
  const handleOpen = () => {
    setDisableClose(false);
  }
  
  const handleClose = () => {
    props.setGame(null);
  };
  
  const handleCreate = () => {
    setDisableClose(true);
    handleClose();
    
    const newClient = socketIOClient('/');
    
    setSocket(newClient);
    newClient.on('notification', data => {console.log(data)});
    
    console.log(props.game.title);
  };
  
  return (
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
  );
}

GameActionModal.propTypes = {
  game: PropTypes.object,
  setGame: PropTypes.func.isRequired
}