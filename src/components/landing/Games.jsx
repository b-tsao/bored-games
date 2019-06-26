import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {PlayerContext} from '../../contexts/PlayerContext';

const useStyles = makeStyles(theme => ({
  games: {
    width: 131,
    height: 175,
  }
}));

function spectate(playerName) {
  const data = {
    playerName
  }
  
  fetch('/avalon/spectate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then((response) => {
      
  });
}

export default function Games() {
  const playerName = useContext(PlayerContext);
  const classes = useStyles();
    
  return (
    <div>
      <Link to='/avalon/waiting' onClick={() => {spectate(playerName)}}>
        <img id="avalon" className={classes.games} src={window.location.origin + "/images/games/avalon.jpg"} alt="The Resistance: Avalon" />
      </Link>
    </div>
  );
}