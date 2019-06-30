import React, {useState} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import Main from './components/landing/Main';
import Room from './components/avalon/Room';

import {ClientContext} from './Contexts';

export default function App() {
  const [client, setClient] = useState(null);
  
  return (
    <ClientContext.Provider value={[client, setClient]}>
      <Router>
        <Route exact path="/" component={Main} />
        <Route path="/avalon" component={Room} />
      </Router>
    </ClientContext.Provider>
  );
}