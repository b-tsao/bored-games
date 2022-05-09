import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Container,
  Grid
} from '@material-ui/core';
import GameCard from './components/GameCard';
import GameActionModal from './components/GameActionModal';

const useStyles = makeStyles(theme => ({
  cardGrid: {
    padding: theme.spacing(3),
    display: 'flex',
    flexWrap: 'wrap'
  },
}));

export default function Games() {
  const classes = useStyles();

  const [games, setGames]: [any[], (...args: any[]) => any] = useState([]);
  const [game, setGame]: [any, (...args: any[]) => any] = useState(null);

  useEffect(() => {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      // Call a function when the state changes.
      if (req.readyState === XMLHttpRequest.DONE) {
        // Request finished. Do processing here.
        if (req.status === 200) {
          setGames(JSON.parse(req.response));
        } else {
          // TODO error
        }
      }
    };

    req.open('GET', '/games/all');
    req.send();
    return () => {};
  }, []);

  return (
    <Container className={classes.cardGrid} maxWidth="md">
      <GameActionModal
        game={game}
        onClose={() => { setGame(null) }} />
      <Grid container spacing={4}>
        {games.map((game, idx) =>
          <Grid item key={idx} xs={12} sm={6} md={4}>
            <GameCard
              key={idx}
              id={game.id}
              title={game.title}
              subtitle={game.subtitle}
              image={game.image}
              onClick={gameCard => { setGame({ id: game.id, title: game.title, disabled: game.disabled, gameCard }) }} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}