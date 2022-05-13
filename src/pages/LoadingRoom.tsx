import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import { CircularProgress, LinearProgress } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
}));

export default function Maintenance({ progress }) {
  const classes = useStyles();

  const loading = progress ? (
    <React.Fragment>
      <p>{progress}%</p>
      <LinearProgress variant='determinate' value={progress} />
    </React.Fragment>
  ) :
  (
    <CircularProgress variant='indeterminate' />
  );
  
  return (
    <div className={classes.root}>
      <h1>Loading room</h1>

      <p>Sit back and relax for a bit!</p>
      {loading}
    </div>
  );
}