import React, { useState, useRef, useEffect } from 'react';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: fade(theme.palette.background.default, .7)
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

  const scroll = useRef<any>(null);

  // Pair representing the current and max scroll position as well number of chat messages.
  const [scrollPos, setScrollPos] = useState<Array<number>>([0, 0]);

  /** Monitor user scroll event. */
  useEffect(() => {
    const onScroll = () => setScrollPos([scroll.current.scrollTop, scroll.current.scrollHeight - scroll.current.clientHeight]);

    const element = scroll.current;

    if (element !== null) element.addEventListener("scroll", onScroll);

    return () => {
      if (element !== null) element.removeEventListener("scroll", onScroll);
    };
  }, []);

  /** Keep scrollbar anchored if scrolled to the bottom. */
  useEffect(() => {
    const element = scroll.current;

    // Browsers inaccurately track scroll position sometimes.
    if ((scrollPos[0] <= scrollPos[1] + 1 && scrollPos[0] >= scrollPos[1] - 1)) {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    }
  }, [chatState, scrollPos]);

  return (
    <Box display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        <Box {...{ ref: scroll } as any} className={classes.chat} display="flex" flexDirection="column" flexGrow={1}>
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
      </Paper>
    </Box>
  );
}

export default Chat;
