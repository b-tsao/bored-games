import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles';
import { Paper, Box, withStyles, Tabs, Tab } from '@material-ui/core';
import Log from './Log';

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
  }
}));

function Chats({ className, chats }) {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
        {/* <AntTabs className={classes.tabs} value={value} onChange={handleChange} aria-label="multichat">
          {Object.keys(chats).map((cid) => (
            <AntTab key={cid} label={chats[cid].title} />
          ))}
        </AntTabs> */}
        <Log chatState={chats[0].chat} />
      </Paper>
    </Box>
  );
}

export default Chats;
