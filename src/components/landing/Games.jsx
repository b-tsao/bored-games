import React from 'react';
import {makeStyles} from '@material-ui/core/styles';

import GameCard from './GameCard';

const useStyles = makeStyles(theme => ({
  games: {
    paddingLeft: 0,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: 48
    },
    display: 'flex',
    flexWrap: 'wrap',
  }
}));

export default function Games() {
  const classes = useStyles();
    
  return (
    <div className={classes.games}>
      <GameCard />
    </div>
  );
}