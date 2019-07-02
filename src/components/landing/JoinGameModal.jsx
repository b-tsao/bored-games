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

export default function JoinGameModal(props) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  
  const handleOpen = () => {
    setKey('');
    setError('');
  }
  
  const handleChange = (event) => {
    if (error) {
      setError('');
    }
    setKey(event.target.value);
  };
  
  const handleJoin = () => {
    const err = props.handleJoin(key);
    
    if (err) {
      setError(err);
    } else {
      props.handleClose();
    }
  };
  
  const errorContent = error ? <DialogContentText>{error}</DialogContentText> : null;
  
  return (
    <Dialog
      open={props.open}
      onEnter={handleOpen}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        Join Game
      </DialogTitle>
      <DialogContent>
        <TextField
          id="key"
          label="Room Key"
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
          id="submit"
          variant="contained"
          color="primary"
          onClick={handleJoin}>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}

JoinGameModal.propTypes = {
  open: PropTypes.bool,
  handleJoin: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}