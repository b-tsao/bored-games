import React, {useState, useContext} from 'react';
import {Link} from 'react-router-dom';
import {PlayerContext} from '../../contexts/PlayerContext';
import CreateGameModal from './CreateGameModal';
import {
  Button,
} from '@material-ui/core';

export default function Lobby() {
  const playerName = useContext(PlayerContext);
  const [games, setGames] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  
  const openCreateGame = () => {
    setOpenCreate(true);
  };
  
  const createGame = async (name, callback) => {
    if (name.length === 0) {
      return callback("Enter a valid name");
    }
    
    const data = {
      gameName: name
    };
    
    fetch('/avalon/create', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then((response) => {
      return callback("Not implemented yet");
    });
  };
  
  return (
    <div>
      <CreateGameModal
        open={openCreate}
        setOpen={setOpenCreate}
        createGame={createGame} />
      <h1>The Resistance: Avalon</h1>

      <p>This is the ghetto lobby for Avalon!</p>
      
      <ul>
        {games.map(function(name, i) {
          return <li key={i}>{name}</li>;
        })}
      </ul>
      
      <Link to='/' style={{textDecoration: 'none'}}>
        <Button
        id="exit"
        variant="contained"
        color="primary">
        Exit
      </Button>
      </Link>
      <Button
        id="create"
        variant="contained"
        color="primary"
        style={{marginLeft: '10px'}}
        onClick={openCreateGame}>
        Create
      </Button>
    </div>
  );
}