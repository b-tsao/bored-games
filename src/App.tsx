import React, { useState, useEffect } from 'react';
import {
  Route,
  BrowserRouter as Router
} from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { CssBaseline } from '@material-ui/core';

/* Import Components */
import Main from './pages/Main';
import GameRoom from './pages/game/GameRoom';

import { ThemeContext, ClientContext, MainDisplayContext } from './Contexts';

// Store default theme to use default theme variables. 
const defaultTheme = createMuiTheme();

export default function App() {
  const themeMode = localStorage.getItem('themeMode');

  const [theme, setTheme]: any = useState({
    overrides: {
      MuiIconButton: {
        root: {
          padding: defaultTheme.spacing(1),
        },
      },
    },
    palette: {
      type: themeMode ? themeMode : "light"
    }
  });
  const [mainDisplay, setMainDisplay] = useState('home');
  const [client, setClient] = useState(null);

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
        <MainDisplayContext.Provider
          value={[mainDisplay, setMainDisplay]}>
          <ClientContext.Provider value={[client, setClient]}>
            <CssBaseline />
            <Router>
              <Route exact path="/" component={Main} />
              <Route path="/game" component={GameRoom} />
            </Router>
          </ClientContext.Provider>
        </MainDisplayContext.Provider>
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}