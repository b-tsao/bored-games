import React, {useState} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import Main from './components/landing/Main';
import Lobby from './components/avalon/Lobby';

import {SocketContext} from './Contexts';

export default function App() {
  const [socket, setSocket] = useState(null);
  
  return (
    <SocketContext.Provider value={[socket, setSocket]}>
      <Router>
        <Route exact path="/" component={Main} />
        <Route path="/avalon" component={Lobby} />
      </Router>
    </SocketContext.Provider>
  );
}