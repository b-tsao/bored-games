import React, {useState} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import Main from './components/landing/Main';
import GameRoom from './components/landing/game/GameRoom';

import {ClientContext} from './Contexts';

export default function App() {
  const [client, setClient] = useState(null);
  
  return (
    <ClientContext.Provider value={[client, setClient]}>
      <Router>
        <Route exact path="/" component={Main} />
        <Route path="/game" component={GameRoom} />
      </Router>
    </ClientContext.Provider>
  );
}