import React from 'react';
import ReactDOM from 'react-dom';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

/* Import Components */
import NameRequestModal from './components/landing/NameRequestModal';
import HelloWorld from './components/landing/HelloWorld';
import Lobby from './components/avalon/Lobby';
import WaitingRoom from './components/avalon/WaitingRoom';

const isMobile = window.innerWidth < 450;

ReactDOM.render(
  <div>
    <Router>
      <Route exact path="/" component={HelloWorld}/>
      <Route exact path="/avalon" component={Lobby} />
      <Route path="/avalon/waiting" component={WaitingRoom}/>
    </Router>
  </div>, document.getElementById('main')
);