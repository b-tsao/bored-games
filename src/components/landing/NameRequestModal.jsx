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
  const [open, setOpen] = useState(true);
  const [disable, setDisable] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const handleOpen = () => {
    setDisable(false);
  }

  const handleClose = () => {
    setName('');
    setError('');
  }
  
  const handleChange = (event) => {
    if (error) {
      setError('');
    }
    setName(event.target.value);
  };
  
  const handleCancel = () => {
    history.go(-1);
  }
  
  const handleSubmit = () => {
    setDisable(true);
    props.setName(name, (err) => {
      if (err) {
        handleOpen();
      } else {
        setOpen(false);
      }
    });
  };
  
  const errorContent = error ? <DialogContentText>{error}</DialogContentText> : null;
  
  return (
    <Dialog
      open={open}
      onEnter={handleOpen}
      onClose={handleClose}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
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
          onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          id="submit"
          variant="contained"
          color="primary"
          disabled={disable}
          onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NameRequestModal.propTypes = {
  setName: PropTypes.func.isRequired
}