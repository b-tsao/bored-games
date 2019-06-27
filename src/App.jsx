import React from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';

/* Import Contexts */
import {ThemeContext} from './Contexts';

/* Import Components */
import NameRequestModal from './components/landing/NameRequestModal';
import Main from './components/landing/Main';
import Lobby from './components/avalon/Lobby';
import WaitingRoom from './components/avalon/WaitingRoom';

const useStyles = makeStyles(theme => ({
  desktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  mobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  }
}));

export default function App() {
  const classes = useStyles();
  
  return (
    <ThemeContext.Provider value={classes}>
      <Router>
        <Route exact path="/" component={Main} />
        <Route exact path="/avalon" component={Lobby} />
        <Route path="/avalon/waiting" component={WaitingRoom} />
      </Router>
    </ThemeContext.Provider>
  );
}