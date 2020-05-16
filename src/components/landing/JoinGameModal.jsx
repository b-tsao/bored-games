import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography
} from '@material-ui/core';

export default function JoinGameModal(props) {
  const [key, setKey] = useState('');
  
  const handleOpen = () => {
    setKey('');
  }
  
  const handleChange = (event) => {
    setKey(event.target.value);
  };
  
  const handleJoin = () => {
    props.handleClose();
    props.handleJoin(key);
  };
  
  return (
    <Dialog
      open={props.open}
      onEnter={handleOpen}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
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
          disabled={key.length === 0}
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