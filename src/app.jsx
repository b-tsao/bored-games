import React from 'react';
import ReactDOM from 'react-dom';
import {Route, BrowserRouter, hashHistory} from 'react-router-dom';

/* Import Components */
import Header from './components/headers/Header';
import HelloWorld from './components/landing/HelloWorld';
import WaitingRoom from './components/avalon/WaitingRoom';

const isMobile = window.innerWidth < 450;

ReactDOM.render(
  <div>
    <Header />
    <BrowserRouter>
      <Route exact path="/" component={HelloWorld}/>
      <Route path="/waiting" component={WaitingRoom}/>
    </BrowserRouter>
  </div>, document.getElementById('main')
);