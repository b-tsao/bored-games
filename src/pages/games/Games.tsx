import React, { useState } from 'react';
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

const games = [
  {
    id: 'the-resistance-avalon',
    title: 'The Resistance: Avalon',
    subtitle: 'Social Deduction, Deception, Teamwork, Co-op',
    image: 'https://cdn.glitch.com/d9f05fc8-83a1-4f59-98e2-2ce32c0f849d%2Favalon.jpg?v=1565656821873'
  },
  {
    id: 'mahjong',
    title: 'Mahjong',
    subtitle: 'Strategy',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSx8XvsNSn730b4puD7w2F4FtV0kCtcylFhGI0ZeNuzgDa2WRBB&usqp=CAU'
  }
];

export default function Games() {
  const classes = useStyles();

  const [game, setGame]: [any, (...args: any[]) => any] = useState(null);

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
              onClick={gameCard => { setGame({ id: game.id, gameCard }) }} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}