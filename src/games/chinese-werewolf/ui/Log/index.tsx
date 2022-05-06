import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Toolbar, Typography, Paper, Box } from '@material-ui/core';
import Chat from './Chat';

const useStyles = makeStyles((theme) => ({
  panel: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: fade(theme.palette.background.default, 0)
  }
}));

function Log({ className, chatState }) {
  const classes = useStyles();

  return (
    <Box className={className}>
      <Paper className={classes.panel} elevation={0}>
          <Chat chatState={chatState} />
      </Paper>
    </Box>
  );
}

export default Log;
