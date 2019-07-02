import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
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

export default function ProgressModal(props) {
  const [disableClose, setDisableClose] = useState(true);
  
  const classes = useStyles();
  
  const progress = props.showProgress? <LinearProgress /> : null;
  
  return (
    <Dialog
      open={props.open}
      disableBackdropClick={disableClose}
      disableEscapeKeyDown={disableClose}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title">
      <DialogContent>
        <div className={classes.loading}>
          <Typography
            variant="overline"
            display="block">
            {props.status}
          </Typography>
          {progress}
          <Typography
            className={classes.loadingMessage}
            variant="body2">
            {props.message}
          </Typography>
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

ProgressModal.propTypes = {
  open: PropTypes.bool.isRequired,
  status: PropTypes.string,
  showProgress: PropTypes.bool,
  message: PropTypes.string,
  handleClose: PropTypes.func
}