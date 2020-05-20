import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
}));

export default function Maintenance() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <h1>Loading room</h1>

      <p>Sit back and relax for a bit!</p>
    </div>
  );
}