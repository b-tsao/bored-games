import React, { useState, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import { ClientContext } from '../../../Contexts';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent
} from '@material-ui/core';
import {
  Send as CreateIcon
} from '@material-ui/icons';

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
  const [client] = useContext(ClientContext);

  const [key, setKey] = useState('');

  const classes = useStyles();

  const handleCreate = () => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      // Call a function when the state changes.
      if (req.readyState === XMLHttpRequest.DONE) {
        // Request finished. Do processing here.
        if (req.status === 201) {
          setKey(JSON.parse(req.response).key);
        } else {
          // TODO error
        }
      }
    };

    req.open('POST', '/room/create');
    // Send the proper header information along with the request
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    req.send(JSON.stringify({ id: props.game.id, title: props.game.title }));
  };

  if (key !== '') {
    return <Redirect to={`/room/${key}`} />
  } else {
    return (
      <div>
        <Dialog
          open={!!props.game}
          onClose={props.onClose}
          aria-labelledby='form-dialog-title'>
          <DialogContent className={classes.content}>
            <div className={classes.card}>
              {props.game ? props.game.gameCard : null}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              id='create'
              variant='contained'
              color='primary'
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
}

GameActionModal.propTypes = {
  game: PropTypes.object,
  onClose: PropTypes.func
}