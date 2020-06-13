import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2)
  }
}));

export default function Maintenance() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Container component='main' className={classes.main} maxWidth='md'>
        <img
          src='https://i.pinimg.com/736x/d6/34/a4/d634a4f3677e84eb1dce18fdba0cb2e6.jpg'
          alt='Page is under maintenance'
        />
      </Container>
    </div>
  );
}
