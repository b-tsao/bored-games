import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, IconButton, InputBase, Divider, Avatar } from '@material-ui/core';
import clsx from 'clsx';

import { Send } from '@material-ui/icons';

import { ClientContext } from '../../../../Contexts';

const useStyles = makeStyles((theme) => ({
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  chat: {
    // Allow messages to scroll properly.
    height: 0,
    overflowY: 'auto'
  },
  "@global": {
    ".messages": {
      "& div:first-child": {
        marginTop: "0 !important"
      }
    }
  },
  avatarBox: {
    // Width of Avatar picture.
    minWidth: 40 + theme.spacing(1),
  },
  msgText: {
    wordWrap: "break-word",
    wordBreak: "break-all"
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px 4px',
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing(1),
  },
  rounding: {
    borderRadius: 8,
  },
  roundingNoTop: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTop: "1px solid " + theme.palette.divider
  },
  divider: {
    height: 28,
    margin: 4,
  },
  iconButton: {
    margin: 2,
  },
}));

type Chat = {
  chatState: Array<Object>
}

function Chat({ chatState }) {
  const classes = useStyles();

  const [text, setText] = useState("")
  const [client] = useContext(ClientContext);

  return (
    <Box display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        <Box className={classes.chat} display="flex" flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="column" flex={1} padding={1}>
            <Box flexGrow={1} />

            <div className="messages">
              {
                chatState.map((log, index) => {
                  // Determine if previous message was sent by current user to chain message.
                  let chainMsg = index - 1 >= 0 ? chatState[index - 1].userID === log.userID : false;

                  return (
                    <Box key={index} display="flex" marginTop={1}>
                      <Box className={classes.avatarBox}>
                        {!chainMsg && <Avatar>{log.name ? log.name.charAt(0) : "?"}</Avatar>}
                      </Box>
                      <Box className={classes.msgText} flexGrow={1}>
                        {!chainMsg && <><b>{log.name}</b><br /></>}
                        {log.message}
                      </Box>
                    </Box>
                  );
                })
              }
            </div>
          </Box>
        </Box>

        <Paper
          component="form"
          className={classes.form}
          classes={{ rounded: clsx(classes.rounding, classes.roundingNoTop) }}
          elevation={0}
          onSubmit={(evt) => {
            if (text !== '') {
              client.emit('chat', text);
              setText('');
            }

            // Prevent form from submitting.
            evt.preventDefault();
          }}
        >
          <InputBase
            className={classes.input}
            placeholder="Type a message..."
            inputProps={{ 'aria-label': 'Type a message' }}
            value={text}
            onChange={evt => setText(evt.target.value)}
          />

          <Divider className={classes.divider} orientation="vertical" />

          <IconButton type="submit" className={classes.iconButton} aria-label="Send">
            <Send />
          </IconButton>
        </Paper>
      </Paper>
    </Box>
  );
}

export default Chat;
