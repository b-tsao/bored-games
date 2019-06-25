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
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const handleChange = (event) => {
    if (error) {
      setError('');
    }
    setName(event.target.value);
  };
  
  const handleSubmit = () => {
    const err = props.setName(name);
    if (err) {
      setError(err);
    } else {
      setOpen(false);
    }
  };
  
  const errorContent = error ? <DialogContentText>{error}</DialogContentText> : null;
  
  return (
    <Dialog
      open={open}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Welcome Newbie!</DialogTitle>
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
  setName: PropTypes.func.isRequired
}