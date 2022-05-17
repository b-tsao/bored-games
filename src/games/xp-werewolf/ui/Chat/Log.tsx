import React, { useState, useRef, useEffect } from 'react';
import { alpha } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Avatar, InputBase, Divider, IconButton } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: alpha(theme.palette.background.default, .7)
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
  chatState: Array<Object>
}

function Log({ className, G, ctx, moves, playerID }) {
  const classes = useStyles();

  const [text, setText] = useState('')

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
  }, [G.chat, scrollPos]);

  return (
    <Box className={className} display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        <Box {...{ ref: scroll } as any} className={classes.chat} display="flex" flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="column" flex={1} padding={1}>
            <Box flexGrow={1} />

            <div className="messages">
              {
                G.chat.map((log, index) => {
                  // Determine if previous message was sent by current user to chain message.
                  let chainMsg = index - 1 >= 0 ? G.chat[index - 1].userID === log.userID : false;

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
        {
          ctx.phase === 'setup' ?
            <Paper
              component="form"
              className={classes.form}
              classes={{ rounded: clsx(classes.rounding, classes.roundingNoTop) }}
              elevation={0}
              onSubmit={(evt) => {
                if (text !== '') {
                  moves.setSecret(text);
                  setText('');
                }

                // Prevent form from submitting.
                evt.preventDefault();
              }}
            >
              <InputBase
                className={classes.input}
                placeholder="请输入 XP (注意谨慎！只能输入一次，不可更改)"
                inputProps={{ 'aria-label': 'Type a message' }}
                value={text}
                onChange={evt => setText(evt.target.value)}
                disabled={!ctx.activePlayers || !Object.prototype.hasOwnProperty.call(ctx.activePlayers, playerID)}
              />

              <Divider className={classes.divider} orientation="vertical" />

              <IconButton
                type="submit"
                className={classes.iconButton}
                aria-label="Send"
                disabled={!ctx.activePlayers || !Object.prototype.hasOwnProperty.call(ctx.activePlayers, playerID)}
              >
                <Send />
              </IconButton>
            </Paper> :
            null
        }
      </Paper>
    </Box>
  );
}

export default Log;
