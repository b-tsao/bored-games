import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import GameCard from './GameCard';
import GameActionModal from './GameActionModal';

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

const games = [{title: 'The Resistance: Avalon', subtitle: 'Social Deduction, Deception, Teamwork, Co-op', image: '/images/games/avalon.jpg'}];

export default function Games() {
  const classes = useStyles();
  
  const [game, setGame] = useState(null);
  
  return (
    <div className={classes.games}>
      <GameActionModal
        game={game}
        setGame={setGame} />
      {games.map((game, idx) =>
        <GameCard
          key={idx}
          title={game.title}
          subtitle={game.subtitle}
          image={game.image}
          handleSelect={setGame} />
      )}
    </div>
  );
}