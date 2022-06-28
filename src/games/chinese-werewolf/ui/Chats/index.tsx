import React, { useEffect, useState } from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Paper, Box, withStyles, Tabs, Tab, IconButton, Badge, Zoom } from '@material-ui/core';
import Log from './Log';
import ChatForm from './ChatForm';
import Chat from './Chat';
import { AddCircleOutline } from '@material-ui/icons';

enum ModifyChat {
  None,
  Add,
  Edit
}

const AntTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8',
  },
  indicator: {
    backgroundColor: '#1890ff',
  },
})(Tabs);

const AntTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(4),
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      color: '#40a9ff',
      opacity: 1,
    },
    '&$selected': {
      color: '#1890ff',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#40a9ff',
    },
  },
  selected: {},
}))((props) => <Tab disableRipple {...props} />);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        children
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  panel: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: alpha(theme.palette.background.default, 0)
  },
  tabsPanel: {
    display: 'flex',
    background: alpha(theme.palette.background.default, .7)
  },
  tabs: {
    flexGrow: 1,
    background: alpha(theme.palette.background.default, .7)
  },
  tabPanel: {
    width: '100%',
    height: '100%'
  },
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: alpha(theme.palette.background.default, .7)
  }
}));

function Chats({ className, G, ctx, gameMetadata, moves, playerID }) {
  const classes = useStyles();

  const [tab, setTab] = useState(0);
  const [modify, setModify] = useState(ModifyChat.None);

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (tab >= Object.keys(G.chats).length) {
      setTab(0);
    }
  }, [G.chats]);

  const handleChange = (event, newTab) => {
    setTab(newTab);
    if (modify === ModifyChat.Edit) {
      setTitle('');
      setError('');
      setSelected({});
    }
    setModify(ModifyChat.None);
  };

  const handleChatAdd = () => {
    if (modify === ModifyChat.Edit) {
      setTitle('');
      setError('');
      setSelected({});
      setModify(ModifyChat.Add);
    } else if (modify === ModifyChat.Add) {
      setModify(ModifyChat.None);
    } else {
      setModify(ModifyChat.Add);
    }
  };

  const handleTitleChange = (e, v) => {
    setTitle(v);
    setError('');
  };

  const handleSelect = (key, value) => {
    setSelected({
        ...selected,
        [key]: value
    });
  };

  const handleModifyChat = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setTitle(trimmedTitle);
      setError('请输入聊天室名称');
    } else {
      if (modify === ModifyChat.Edit) {
        setModify(ModifyChat.None);
      } else if (Object.keys(G.chats).filter((cid) => cid === trimmedTitle).length > 0) {
        setTitle(trimmedTitle);
        setError('聊天室名称已存在');
        return;
      }
      setTitle('');
      setError('');
      setSelected({});
      moves.modifyChat(trimmedTitle, [playerID, ...Object.keys(selected).filter((pid) => selected[pid] && pid !== playerID)]);
    }
  };

  const handleEditChat = (cid) => {
    setTitle(cid);
    setError('');
    const selected = {};
    for (const pid of G.chats[cid].participants) {
      selected[pid] = true;
    }
    setSelected(selected);
    setModify(ModifyChat.Edit);
  };

  const handleDeleteChat = (cid) => {
    moves.deleteChat(cid);
    setTab(0);
  };

  const handleLockChat = (cid) => {
    moves.lockChat(cid);
  };

  const handleFreeChat = (cid) => {
    moves.freeChat(cid);
  };

  const handleChat = (cid, message) => {
    if (message.length > 0) {
      moves.chat(cid, message);
    }
  };

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
        <Paper className={classes.tabsPanel}>
          <AntTabs
            className={classes.tabs}
            value={tab}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleChange}
            aria-label="multichat"
          >
            {Object.keys(G.chats).map((cid, idx) => (
              <Zoom key={idx} in={true}>
                <AntTab
                  label={
                    <Badge color="secondary" badgeContent={playerID && tab !== idx ? G.players[playerID].chats[cid] : 0}>
                      {cid}
                    </Badge>
                  } />
              </Zoom>
            ))}
          </AntTabs>
          {
            playerID === String(G.god) ?
              <IconButton color="inherit" aria-label="Add chat" onClick={handleChatAdd}>
                <AddCircleOutline />
              </IconButton> :
              null
          }
        </Paper>
        {
          modify !== ModifyChat.None ?
            <ChatForm
              className={classes.tabPanel}
              error={error}
              title={title}
              disableTitleChange={modify === ModifyChat.Edit}
              playerID={playerID}
              players={G.players}
              selected={selected}
              onTitleChange={handleTitleChange}
              onSelect={handleSelect}
              onSubmit={handleModifyChat}
            /> :
            Object.keys(G.chats).map((cid, idx) => (
              <TabPanel key={idx} className={classes.tabPanel} value={tab} index={idx}>
                {
                  cid === '记录' ?
                    <Log className={classes.tabPanel} chatState={G.chats['记录'].chat} /> :
                    <Chat
                      G={G}
                      gameMetadata={gameMetadata}
                      moves={moves}
                      playerID={playerID}
                      cid={cid}
                      chat={G.chats[cid]}
                      onChat={(message) => handleChat(cid, message)}
                      editChat={() => handleEditChat(cid)}
                      deleteChat={() => handleDeleteChat(cid)}
                      lockChat={() => handleLockChat(cid)}
                      freeChat={() => handleFreeChat(cid)}
                    />
                }
              </TabPanel>
            ))
        }
      </Paper>
    </Box>
  );
}

export default Chats;
