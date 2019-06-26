import React, {useState} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Contexts */
import {PlayerContext} from './contexts/PlayerContext';

/* Import Components */
import NameRequestModal from './components/landing/NameRequestModal';
import HelloWorld from './components/landing/HelloWorld';
import Lobby from './components/avalon/Lobby';
import WaitingRoom from './components/avalon/WaitingRoom';

const isMobile = window.innerWidth < 450;

export default function App() {
  const [playerName, setPlayerName] = useState('');
  
  const setPlayerNameWrapper = (name) => {
    if (name.length === 0) {
      return "P13@$3 3nt3r y0ur n&m3 y0u i1l!t3r@t3 f*#%";
    } else {
      setPlayerName(name);
      return false;
    }
  };
  
  return (
    <PlayerContext.Provider value={playerName}>
      <NameRequestModal setName={setPlayerNameWrapper} />
      <Router>
        <Route exact path="/" component={HelloWorld}/>
        <Route exact path="/avalon" component={Lobby} />
        <Route path="/avalon/waiting" component={WaitingRoom}/>
      </Router>
    </PlayerContext.Provider>
  );
}