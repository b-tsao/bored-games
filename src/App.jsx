import React, {useState, useEffect} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import Main from './components/landing/Main';
import GameRoom from './components/landing/game/GameRoom';

import {ClientContext, MainDisplayContext} from './Contexts';

export default function App() {
  const [client, setClient] = useState(null);
  const [mainDisplay, setMainDisplay] = React.useState('home');
  
  useEffect(() => {
    if (client) {
      const setCookieHandler = cookie => {
        document.cookie = cookie;
      };
      
      client.on('setCookie', setCookieHandler);

      return () => {
        client.off('setCookie', setCookieHandler);
      };
    }
  }, [client]);
  
  return (
    <ClientContext.Provider value={[client, setClient]}>
      <MainDisplayContext.Provider
    value={[mainDisplay, setMainDisplay]}>
        <Router>
          <Route exact path="/" component={Main} />
          <Route path="/game" component={GameRoom} />
        </Router>
      </MainDisplayContext.Provider>
    </ClientContext.Provider>
  );
}