import React, { useEffect, useRef, useState } from "react";
import { alpha, createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Box, IconButton, Paper, Toolbar, Typography } from "@material-ui/core";
import { TextInput } from "./components/TextInput";
import { MessageLeft, MessageRight } from "./components/Message";
import { Delete, Edit } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
      background: alpha(theme.palette.background.default, .7)
    },
    paper2: {
      width: "80vw",
      maxWidth: "500px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
    },
    headerRoot: {
      width: "100%"
    },
    headerGutters: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    shrinkRipple: {
      padding: theme.spacing(1),
    },
    container: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    messagesBody: {
      display: "flex",
      flexDirection: "column",
      width: "calc( 100% - 20px )",
      margin: 10,
      overflowY: "scroll",
      height: "calc( 100% - 80px )",
      background: alpha(theme.palette.background.default, .7)
    },
    names: {
      display: 'flex',
      overflow: 'auto'
    },
    name: {
      marginRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      background: alpha(theme.palette.background.default, .7)
    }
  })
);

export default function Chat({ G, gameMetadata, moves, playerID, cid, chat, onChat, editChat, deleteChat }) {
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
  }, [chat.chat, scrollPos]);

  useEffect(() => {
    moves.read(cid);
  }, [chat]);

  return (
    <div className={classes.container}>
      {/* <Paper className={classes.paper} zDepth={2}> */}
      <Paper className={classes.paper}>
        {/* header */}
        <Toolbar classes={{ root: classes.headerRoot, gutters: classes.headerGutters }} variant="dense">
          <div className={classes.names}>
            {
              chat.participants.map((pid, idx) => (
                <Paper key={idx} className={classes.name}>
                  <Typography variant="h6" color="inherit">
                    {gameMetadata ? gameMetadata[pid].name : `${pid}号玩家`}
                  </Typography>
                </Paper>
              ))
            }
          </div>

          <Box flexGrow={1} />

          {
            playerID === String(G.god) ?
              <div>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Edit chat" onClick={editChat}>
                  <Edit />
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Delete chat" onClick={deleteChat}>
                  <Delete />
                </IconButton>
              </div> :
              null
          }
        </Toolbar>
        <Paper {...{ ref: scroll } as any} id="style-1" className={classes.messagesBody}>
          <Box flexGrow={1} />
          {/* <MessageLeft
            message="あめんぼあかいなあいうえお"
            timestamp="MM/DD 00:00"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName=""
          />
          <MessageLeft
            message="xxxxxhttps://yahoo.co.jp xxxxxxxxxあめんぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさぼあかいなあいうえおあいうえおかきくけこさいすせそ"
            timestamp="MM/DD 00:00"
            photoURL=""
            displayName="テスト"
          />
          <MessageRight
            message="messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえおあめんぼあかいなあいうえお"
            timestamp="MM/DD 00:00"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName="まさりぶ"
          />
          <MessageRight
            message="messageRあめんぼあかいなあいうえおあめんぼあかいなあいうえお"
            timestamp="MM/DD 00:00"
            photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
            displayName="まさりぶ"
          /> */}
          {chat.chat.map(({ name, message, userID }, idx) =>
            userID === '00' ? (
              <MessageLeft
                key={idx}
                message={message}
                photoURL="https://lh3.googleusercontent.com/a-/AOh14Gi4vkKYlfrbJ0QLJTg_DLjcYyyK7fYoWRpz2r4s=s96-c"
                displayName={name}
              />
            ) : userID === playerID ? (
              <MessageRight
                key={idx}
                message={message}
                displayName={gameMetadata ? gameMetadata[userID].name : name}
                avatarAlt={name}
              />
            ) : (
              <MessageLeft
                key={idx}
                message={message}
                displayName={gameMetadata ? gameMetadata[userID].name : name}
                avatarAlt={name}
              />
            )
          )}
        </Paper>
        <TextInput onSubmit={onChat} disabled={chat.disabled} />
      </Paper>
    </div>
  );
}
