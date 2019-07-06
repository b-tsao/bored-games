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

export default function ConnectModal(props) {
  const [disableClose, setDisableClose] = useState(true);
  const [connectState, setConnectState] = useState({
    status: '',
    progress: false,
    message: ''
  });
  
  const classes = useStyles();
  
  const handleEnter = () => {
    if (!props.client) {
      console.error('No client provided for connection');
      return;
    } else if (!props.event) {
      console.error('No event provided for connection');
      return;
    }
    
    setConnectState({
      status: 'connecting',
      progress: true,
      message: 'Establishing connection'
    });
    
    const handler = (data) => {
      if (data.status === 'error') {
        props.client.off(props.event, handler);
        setConnectState({
          status: data.status,
          progress: false,
          message: data.message
        });
      } else if (data.status === 'complete') {
        props.client.off(props.event, handler);
        props.onComplete();
      } else {
        setConnectState({
          status: data.status,
          progress: true,
          message: data.message
        });
      }
    };
    
    props.client.on(props.event, handler);
    props.client.emit(props.event, props.data);
  }
  
  const onCancel = () => {
    if (connectState.status === 'error') {
      props.onClose();
    }
  };
  
  const linearProgress = connectState.progress ? <LinearProgress /> : null;
  
  return (
    <Dialog
      open={props.connect}
      disableBackdropClick={disableClose}
      disableEscapeKeyDown={disableClose}
      onEnter={handleEnter}
      onClose={props.onClose}
      aria-labelledby="form-dialog-title">
      <DialogContent>
        <div className={classes.loading}>
          <Typography
            variant="overline"
            display="block">
            {connectState.status}
          </Typography>
          {linearProgress}
          <Typography
            className={classes.loadingMessage}
            variant="body2">
            {connectState.message}
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          id="create"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={onCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConnectModal.propTypes = {
  connect: PropTypes.bool,
  client: PropTypes.object,
  event: PropTypes.string,
  data: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  onComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}