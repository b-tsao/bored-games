import React from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Paper, Box, withStyles, Tabs, Tab } from '@material-ui/core';
import Log from './Log';
import ChatForm from './ChatForm';
import Chat from './Chat';

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
  tabs: {
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

  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  const handleNewChat = (title, players, cb) => {
    if (title.length === 0) {
      cb('请输入聊天室名称');
    } else if (Object.keys(G.chats).filter((cid) => cid === title).length > 0) {
      cb('聊天室名称已存在');
    } else {
      cb();
      moves.newChat(title, players);
    }
  };

  const handleEditChat = (cid) => {

  };

  const handleChat = (cid, message) => {
    moves.chat(cid, message);
  };

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
        <AntTabs
          className={classes.tabs}
          value={tab}
          variant="scrollable"
          onChange={handleChange}
          aria-label="multichat"
        >
          {Object.keys(G.chats).map((cid, idx) => (
            <AntTab key={idx} label={cid} />
          ))}
          {
            playerID === String(G.god) ?
              <AntTab label='新增' /> :
              null
          }
        </AntTabs>
        {Object.keys(G.chats).map((cid, idx) => (
          <TabPanel key={idx} className={classes.tabPanel} value={tab} index={idx}>
            {
              cid === '记录' ?
                <Log className={classes.tabPanel} chatState={G.chats['记录'].chat} /> :
                <Chat
                  G={G}
                  gameMetadata={gameMetadata}
                  playerID={playerID}
                  chat={G.chats[cid]}
                  onChat={(message) => handleChat(cid, message)}
                  deleteChat={() => moves.deleteChat(cid)}
                />
            }
          </TabPanel>
        ))}
        {
          playerID === String(G.god) ?
            <TabPanel className={classes.tabPanel} value={tab} index={Object.keys(G.chats).length}>
              <ChatForm
                className={classes.tabPanel}
                playerID={playerID}
                players={G.players}
                onSubmit={handleNewChat}
              />
            </TabPanel> :
            null
        }
      </Paper>
    </Box>
  );
}

export default Chats;
