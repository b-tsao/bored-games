import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
}));

export default function HelloWorld() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <h1>Hello, World!</h1>

      <p>This is the ghetto landing page for <del>bored</del> <ins>board</ins> games! A quick project written and hosted on <a href="http://glitch.com">Glitch</a> to help friends play board games together without the need for physical board pieces or setup.</p>
    </div>
  );
}