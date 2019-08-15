import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {
  Container,
  Grid
} from '@material-ui/core';
import GameCard from './GameCard';
import GameActionModal from './GameActionModal';

const useStyles = makeStyles(theme => ({
  cardGrid: {
    padding: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap'
  },
}));

const games = [{title: 'The Resistance: Avalon', subtitle: 'Social Deduction, Deception, Teamwork, Co-op', image: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Favalon.jpg?v=1565656821873'}];

export default function Games() {
  const classes = useStyles();
  
  const [game, setGame] = useState(null);
  
  return (
    <Container className={classes.cardGrid} maxWidth="md">
      <GameActionModal
          game={game}
          setGame={setGame} />
      <Grid container spacing={4}>
        {games.map((game, idx) =>
         <Grid item key={idx} xs={12} sm={6} md={4}>
          <GameCard
            key={idx}
            title={game.title}
            subtitle={game.subtitle}
            image={game.image}
            handleSelect={setGame} />
         </Grid>
        )}
      </Grid>
    </Container>
  );
}