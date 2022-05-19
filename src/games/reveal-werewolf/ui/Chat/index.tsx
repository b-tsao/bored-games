import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles';
import { Paper, Box } from '@material-ui/core';
import Log from './Log';

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

function Chat({ className, G, ctx, moves, playerID }) {
  const classes = useStyles();

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
        <Log className={classes.tabPanel} G={G} ctx={ctx} moves={moves} playerID={playerID} />
      </Paper>
    </Box>
  );
}

export default Chat;
