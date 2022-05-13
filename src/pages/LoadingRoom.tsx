import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, CircularProgress, LinearProgress, LinearProgressProps, Typography } from '@material-ui/core';

const useLinearProgressWithLabelStyles = makeStyles(theme => ({
  bar: {
    width: '100%'
  }
}));

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  const classes = useLinearProgressWithLabelStyles();

  return (
    <Box>
      <Typography variant="body2">{`${props.value}%`}</Typography>
      <Box className={classes.bar}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
}));

export default function Maintenance({ progress }) {
  const classes = useStyles();

  const loading = progress ? (
    <LinearProgressWithLabel value={progress} />
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