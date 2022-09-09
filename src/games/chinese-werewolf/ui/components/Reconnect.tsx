import React, { useContext, useState } from 'react';

import {
    Button,
    Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@material-ui/core';

import { ClientContext } from '../../../../Contexts';

export default function Reconnect({ pid }) {
  const [client] = useContext(ClientContext);
  const [openWarningModal, setOpenWarningModal] = useState(false);

  const handleWarningClose = (reconnect) => {
    if (reconnect) {
      client.emit('bgioChangePlayer', pid);
    }
    setOpenWarningModal(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={openWarningModal}
        onClose={() => {handleWarningClose(false)}}
      >
        <DialogTitle id="reconnect-alert-dialog-title">{"接管离线玩家"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="reconnect-alert-dialog-description">
            {`此🔗为接手目前离线的${pid}号玩家，该玩家若连线将变成观众。`}
          </DialogContentText>
          <DialogContentText id="reconnect-alert-dialog-description">
            是否接手？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleWarningClose(false)} color="secondary">
            否
          </Button>
          <Button onClick={() => handleWarningClose(true)} color="primary" autoFocus>
            是
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip arrow title='接管离线玩家'>
        <IconButton color="inherit" aria-label="reconnect" onClick={() => { setOpenWarningModal(true) }}>🔗</IconButton>
      </Tooltip>    
    </React.Fragment>
  );
}