import React, { useState, useRef, useEffect, useContext } from 'react';
import { alpha } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Avatar, Toolbar, IconButton, Typography } from '@material-ui/core';
import { HourglassEmpty, HourglassFull } from '@material-ui/icons';

import { ClientContext } from '../../../../Contexts';

const useStyles = makeStyles((theme) => ({
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: alpha(theme.palette.background.default, .7)
  },
  headerGutters: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  shrinkRipple: {
    padding: theme.spacing(1),
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

type Log = {
  chatState: Array<Object>;
}

function Log({ className, chatState, record }) {
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

  // Timer
  const [client] = useContext(ClientContext);
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    if (client) {
      const setGameTimer = (time) => {
        setTimer(time);
      };

      client.on('bgioTimer', setGameTimer);

      return () => {
        client.off('bgioTimer', setGameTimer);
      };
    }
  }, [client]);

  const timerString = (timer) => {
    const date = new Date(0);
    date.setSeconds(timer); // specify value for SECONDS here
    return `计时：${date.toISOString().substr(11, 8)}`;
  }

  const startTimer = () => {
    client.emit('bgioTimer');
  };

  const stopTimer = () => {
    record(timerString(timer));
    client.emit('bgioTimer');
  };

  return (
    <Box className={className} display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        {
          <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
            <Typography>
              {timer !== null && timerString(timer)}
            </Typography>

            <Box flexGrow={1} />

            {
              !!record &&
                <div>
                  {
                    timer === null
                      ? (
                        <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="timer-on" onClick={startTimer}>
                          <HourglassEmpty />
                        </IconButton>
                      )
                      : (
                        <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="timer-off" onClick={stopTimer}>
                          <HourglassFull />
                        </IconButton>
                      )
                  }
                </div>
            }
          </Toolbar>
        }
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

export default Log;
