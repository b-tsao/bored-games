import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import CreateGameModal from './CreateGameModal';
import {
  Button,
} from '@material-ui/core';

export default function LobbyActionButtons(props) {
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

  const gameActionButton = props.id ?
    <Link to='/avalon/waiting' style={{textDecoration: 'none'}}>
      <Button
        id="join"
        variant="contained"
        color="primary"
        style={{marginLeft: '10px'}}>
        Join
      </Button>
    </Link> :
    <Button
      id="create"
      variant="contained"
      color="primary"
      style={{marginLeft: '10px'}}
      onClick={openCreateGame}>
      Create
    </Button>;
  
  return (
    <div>
      <CreateGameModal
        open={openCreate}
        setOpen={setOpenCreate}
        createGame={createGame} />
      <Link to='/' style={{textDecoration: 'none'}}>
        <Button
          id="exit"
          variant="contained"
          color="primary">
          Exit
        </Button>
      </Link>
      {gameActionButton}
    </div>
  );
}

LobbyActionButtons.propTypes = {
  id: PropTypes.string
}