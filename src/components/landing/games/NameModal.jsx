import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography
} from '@material-ui/core';

export default function NameRequestModal(props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const handleOpen = () => {
    setName('');
    setError('');
  }
  
  const handleChange = (event) => {
    if (error) {
      setError('');
    }
    setName(event.target.value);
  };
  
  const handleJoin = () => {
    props.handleJoin(name, (err) => {
      if (err) {
        setError(err);
      } else {
        props.handleClose();
      }
    });
  };
  
  const errorContent = error ? <DialogContentText>{error}</DialogContentText> : null;
  
  return (
    <Dialog
      open={props.open}
      onEnter={handleOpen}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        Welcome Newbie!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To play with your friends, please enter your name here. It is recommended that you enter your real name.
        </DialogContentText>
        <TextField
          id="name"
          label="Name"
          margin="dense"
          variant="outlined"
          autoFocus
          fullWidth
          required
          onChange={handleChange} />
        {errorContent}
      </DialogContent>
      <DialogActions>
        <Button
          id="cancel"
          variant="contained"
          color="primary"
          onClick={props.handleClose}>
          Cancel
        </Button>
        <Button
          id="join"
          variant="contained"
          color="primary"
          disabled={name.length === 0}
          onClick={handleJoin}>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NameRequestModal.propTypes = {
  open: PropTypes.bool,
  handleJoin: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}