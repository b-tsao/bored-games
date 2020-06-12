import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, IconButton, InputBase, Divider } from '@material-ui/core';
import clsx from 'clsx';

import { Send } from '@material-ui/icons';

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

function Chat() {
  const classes = useStyles();

  const [text, setText] = useState("")
  const [chat, setChat] = useState<Array<{ id: number, text: string }>>([])

  return (
    <Box display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        <Box className={classes.chat} display="flex" flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="column" flex={1} padding={1}>
            <Box flexGrow={1} />

            {
              chat.map(msg => (
                <div key={msg.id}>
                  {msg.text}
                </div>
              ))
            }
          </Box>
        </Box>

        <Paper
          component="form"
          className={classes.form}
          classes={{ rounded: clsx(classes.rounding, classes.roundingNoTop) }}
          elevation={0}
          onSubmit={(evt) => {
            if (text !== '') {
              setChat([...chat, { id: chat.length + 1, text }])
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
