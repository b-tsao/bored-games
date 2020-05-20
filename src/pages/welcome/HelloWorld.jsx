import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Toolbar,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  spacer: {
    flex: '1 1 auto',
  }
}));

export default function HelloWorld() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          Hello, World!
        </Typography>
      </Toolbar>

      <p>This is the ghetto landing page for <del>bored</del> <ins>board</ins> games! A project written and hosted on <a href="http://glitch.com">Glitch</a> to help friends play board games together without the need for physical board pieces or setup.</p>
    </div>
  );
}