import React from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import NameRequestModal from './components/landing/NameRequestModal';
import Main from './components/landing/Main';
import Lobby from './components/avalon/Lobby';
import WaitingRoom from './components/avalon/WaitingRoom';

export default function App() {
  return (
    <div>
      <Router>
        <Route exact path="/" component={Main} />
        <Route exact path="/avalon" component={Lobby} />
        <Route path="/avalon/waiting" component={WaitingRoom} />
      </Router>
    </div>
  );
}