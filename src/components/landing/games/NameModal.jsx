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
  
  const handleSubmit = () => {
    const err = props.handleSubmit(name);
    
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
        Welcome Newbie!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To play with your friends, please enter your name here. It is recommended that you enter your real name.
        </DialogContentText>
        <TextField
          id="name"
          label="Name"
          type="name"
          margin="dense"
          variant="outlined"
          autoFocus
          fullWidth
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
          onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NameRequestModal.propTypes = {
  open: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}