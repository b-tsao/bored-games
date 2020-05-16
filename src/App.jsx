import React, {useState, useEffect} from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

import {MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import {CssBaseline} from '@material-ui/core';

/* Import Components */
import Main from './components/landing/Main';
import GameRoom from './components/landing/game/GameRoom';

import {ThemeContext, ClientContext, MainDisplayContext} from './Contexts';

export default function App() {
  const themeMode = localStorage.getItem('themeMode');
  
  const [client, setClient] = useState(null);
  const [mainDisplay, setMainDisplay] = useState('home');
  const [theme, setTheme] = useState({
    palette: {
      type: themeMode ? themeMode : "light"
    }
  });
  
  const toggleTheme = () => {
    const newPaletteType = theme.palette.type === "light" ? "dark" : "light";
    setTheme({
      palette: {
        type: newPaletteType
      }
    });
    localStorage.setItem('themeMode', newPaletteType);
  };
  
  const muiTheme = createMuiTheme(theme);
  
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeContext.Provider value={[theme, toggleTheme]}>
        <ClientContext.Provider value={[client, setClient]}>
          <MainDisplayContext.Provider
        value={[mainDisplay, setMainDisplay]}>
            <CssBaseline />
            <Router>
              <Route exact path="/" component={Main} />
              <Route path="/game" component={GameRoom} />
            </Router>
          </MainDisplayContext.Provider>
        </ClientContext.Provider>
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}