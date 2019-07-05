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

export default function NameRequestModal(props) {
  const [name, setName] = useState('');
  
  const handleOpen = () => {
    setName('');
  }
  
  const handleChange = (event) => {
    setName(event.target.value);
  };
  
  const handleJoin = () => {
    props.handleJoin(name);
  };
  
  return (
    <Dialog
      open={props.open}
      onEnter={handleOpen}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
      <DialogContent>
        <DialogContentText>
          Enter your name
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