import React, {useContext} from 'react';
import {Link} from 'react-router-dom';
import {PlayerContext} from '../../contexts/PlayerContext';
import {
  Button,
} from '@material-ui/core';

const names = ["Brian", "Ryan", "Curtis", "Wei", "Raymond", "Tony", "Casey"];

export default function WaitingRoom() {
  return (
    <div>
      <h1>The Resistance: Avalon</h1>

      <p>This is the ghetto waiting room for Avalon while you wait for your friends to join!</p>

      <ul>
        {names.map(function(name, i) {
          return <li key={i}>{name}</li>;
        })}
      </ul>

      <Link to='/avalon' style={{textDecoration: 'none'}}>
        <Button
        id="exit"
        variant="contained"
        color="primary">
        Exit
      </Button>
      </Link>
      <Button
        id="join"
        variant="contained"
        color="primary"
        style={{marginLeft: '10px'}}>
        Join
      </Button>
    </div>
  );
}