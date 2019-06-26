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

export default function CreateGameModal(props) {
  const [name, setName] = useState('');
  const [disableClose, setDisableClose] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (event) => {
    if (error) {
      setError('');
    }
    setName(event.target.value);
  };
  
  const handleOpen = () => {
    setDisableClose(false);
  }
  
  const handleClose = () => {
    setName('');
    setError('');
    props.setOpen(false);
  };
  
  const handleCreate = () => {
    setDisableClose(true);
    props.createGame(name, (err) => {
      if (err) {
        setError(err);
        handleOpen();
      } else {
        handleClose();
      }
    });
  };
  
  const errorContent = error ? <DialogContentText>{error}</DialogContentText> : null;
  
  return (
    <Dialog
      open={props.open}
      disableBackdropClick={disableClose}
      disableEscapeKeyDown={disableClose}
      onEnter={handleOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        Create Game
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter a room name
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
          onClick={handleClose}>
          Cancel
        </Button>
        <Button
          id="create"
          variant="contained"
          color="primary"
          disabled={disableClose}
          onClick={handleCreate}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateGameModal.propTypes = {
  open: PropTypes.bool.isRequired,
  createGame: PropTypes.func.isRequired
}