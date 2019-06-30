import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2) + 2
  },
  loading: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1)
  }
}));

export default function LoadingModal(props) {
  const [disableClose, setDisableClose] = useState(true);
  
  const classes = useStyles();
  
  return (
    <Dialog
      open={props.open}
      disableBackdropClick={disableClose}
      disableEscapeKeyDown={disableClose}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">
        {props.title}
      </DialogTitle>
      <DialogContent>
        <div className={classes.container}>
          <LinearProgress />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          id="create"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={props.handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LoadingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  handleClose: PropTypes.func
}