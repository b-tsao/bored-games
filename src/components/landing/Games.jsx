import React from 'react';
import {Link} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  games: {
    width: 131,
    height: 175,
  }
}));

export default function Games() {
  const classes = useStyles();
    
  return (
    <div>
      <Link to='/avalon'>
        <img id="avalon" className={classes.games} src={window.location.origin + "/images/games/avalon.jpg"} alt="The Resistance: Avalon" />
      </Link>
    </div>
  );
}