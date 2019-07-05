import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';

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
  const [progress, setProgress] = useState(true);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  
  const classes = useStyles();
  
  const handleEnter = () => {
    setStatus('connecting');
    setProgress(true);
    setMessage("Establishing connection");
    
    const client = props.client ? props.client : socketIOClient(props.namespace);
    
    client.emit(props.event, props.data);
    
    client.on(props.event, (data) => {
      setStatus(data.status);
      if (data.status === 'error') {
        setProgress(false);
        setMessage(data.message);
      } else if (data.status === 'complete') {
        props.onComplete(client);
      } else {
        setMessage(data.message);
      }
    });
  }
  
  const onCancel = () => {
    if (status === 'error') {
      props.onClose();
    }
  };
  
  const linearProgress = progress ? <LinearProgress /> : null;
  
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
            {status}
          </Typography>
          {linearProgress}
          <Typography
            className={classes.loadingMessage}
            variant="body2">
            {message}
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
  namespace: PropTypes.string,
  event: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  onComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}