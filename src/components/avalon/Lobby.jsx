import React, {useState} from 'react';
import LobbyActionButtons from './LobbyActionButtons';

export default function Lobby() {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState("0");
  return (
    <div>
      <h1>The Resistance: Avalon</h1>

      <p>This is the ghetto lobby for Avalon!</p>
      
      <ul>
        {games.map(function(name, i) {
          return <li key={i}>{name}</li>;
        })}
      </ul>
      
      <LobbyActionButtons id={gameId} />
    </div>
  );
}