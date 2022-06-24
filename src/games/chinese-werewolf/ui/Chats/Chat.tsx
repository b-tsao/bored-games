import React, { useEffect, useRef, useState } from "react";
import { alpha, createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Box, IconButton, Paper, Toolbar, Typography } from "@material-ui/core";
import { TextInput } from "./components/TextInput";
import { MessageLeft, MessageRight } from "./components/Message";
import { Delete, Edit, LeakAdd, LeakRemove } from "@material-ui/icons";
import SelectionInput from "./SelectionInput";
import Cards from "../../game/cards";

const inputs = [
  {
    group: '主语',
    selections: ['全部', '我', '你', '你们'] // will be filled with all player numbers in game (except god)
  },
  {
    group: '名词',
    selections: [] // will be filled with all roles in game
  },
  {
    group: '动词',
    selections: ['🔪刀掉', '🔪自刀', '起跳', '冲锋', '煽动', '倒钩', '垫飞', '扛推', '互踩', '上警', '警下', '冲票', '金水', '查杀', '银水', '吃毒', '开枪', '守护', '骑']
  },
  {
    group: '形容词',
    selections: ['收到', '好', '否', '别', '有身份', '和', '或']
  }
];

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

export default function Chat({ G, gameMetadata, moves, playerID, cid, chat, onChat, editChat, deleteChat, lockChat }) {
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
    return () => {
      // Need try catch for debugging mode when we switch views between players ctx goes undefined
      try {
        moves.read(cid);
      } catch (e) {}
    };
  }, []);

  /** process input options **/
  const options: any[] = [];
  for (const input of inputs) {
    const { group, selections } = input;
    if (group === '主语') {
      // fill all player numbers in game
      const nums: string[] = [];
      for (const pid in G.players) {
        if (pid !== String(G.god)) {
          nums.push(`${pid}号`);
        }
      }
      options.push({ group, selections: [...nums, ...selections] });
    } else if (group === '名词') {
      // fill all roles in game
      const roles = G.roles.map((cid) => Cards[cid].label);
      options.push({ group, selections: [...roles, ...selections] });
    } else {
      options.push({ group, selections });
    }
  }

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
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Lock chat" onClick={lockChat}>
                  {
                    chat.disabled ?
                      <LeakRemove /> :
                      <LeakAdd />
                  }
                </IconButton>
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
        {/* <TextInput onSubmit={onChat} disabled={chat.disabled} label="输入信息" /> */}
        <SelectionInput
          options={options}
          onSubmit={onChat}
          disabled={chat.disabled}
          label="输入信息"
          placeholder="点选词语"
        />
      </Paper>
    </div>
  );
}
