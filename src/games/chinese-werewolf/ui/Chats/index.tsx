import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles';
import { Paper, Box, withStyles, Tabs, Tab } from '@material-ui/core';
import Log from './Log';
import NewChat from './NewChat';

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

function Chats({ className, G, playerID }) {
  const classes = useStyles();

  const [tab, setTab] = React.useState(0);

  const handleChange = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
        <Log className={classes.tabPanel} chatState={G.chats[0].chat} />
        {/* <AntTabs className={classes.tabs} value={tab} onChange={handleChange} aria-label="multichat">
          {Object.keys(G.chats).map((cid) => (
            <AntTab key={cid} label={G.chats[cid].title} />
          ))}
          {
            playerID === String(G.god) ?
              <AntTab label='新增' /> :
              null
          }
        </AntTabs>
        {Object.keys(G.chats).map((cid, idx) => (
          <TabPanel key={cid} className={classes.tabPanel} value={tab} index={idx}>
            {
              cid === String(0) ?
                <Log className={classes.tabPanel} chatState={G.chats[0].chat} /> :
                null // TODO chat windows
            }
          </TabPanel>
        ))}
        {
          playerID === String(G.god) ?
            <TabPanel className={classes.tabPanel} value={tab} index={Object.keys(G.chats).length}>
              <NewChat className={classes.tabPanel} playerID={playerID} players={G.players} />
            </TabPanel> :
            null
        } */}
      </Paper>
    </Box>
  );
}

export default Chats;
