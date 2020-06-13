import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  loading: {
    flexGrow: 1
  },
  loadingMessage: {
    textAlign: 'center'
  },
  button: {
    margin: theme.spacing(1)
  }
}));

export default function MessageModal(props) {
  const [disableClose] = useState(false);

  const classes = useStyles();

  return (
    <Dialog
      open={props.open}
      disableBackdropClick={disableClose}
      disableEscapeKeyDown={disableClose}
      onClose={props.onClose}
      aria-labelledby="form-dialog-title">
      <DialogContent>
        <div className={classes.loading}>
          <Typography
            variant="overline"
            display="block">
            {props.title}
          </Typography>
          <Typography
            className={classes.loadingMessage}
            variant="body2">
            {props.message}
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          id="confirm"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={props.onClose}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

MessageModal.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func.isRequired
}