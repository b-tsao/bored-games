import React, { useState } from 'react';
import {
  Route,
  Switch,
  BrowserRouter as Router
} from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { CssBaseline } from '@material-ui/core';

/* Import Components */
import MessageModal from './components/MessageModal';
import Main from './pages/Main';
import GameRoom from './pages/game/GameRoom';

import { ThemeContext, ClientContext, MessageContext } from './Contexts';

export default function App() {
  const themeMode = localStorage.getItem('themeMode');

  const [theme, setTheme]: any = useState({
    palette: {
      type: themeMode ? themeMode : "light"
    }
  });
  const [client, setClient] = useState(null);
  const [message, setMessage] = useState({
    status: '',
    text: ''
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

  const handleMessageClose = () => {
    setMessage({ status: '', text: '' });
  };

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeContext.Provider value={[theme, toggleTheme]}>
        <ClientContext.Provider value={[client, setClient]}>
          <MessageContext.Provider value={setMessage}>
            <CssBaseline />
            <MessageModal
              open={!!message.text}
              title={message.status}
              message={message.text}
              onClose={handleMessageClose} />
            <Router>
              <Switch>
                <Route path="/room/:id/game">
                  <GameRoom />
                </Route>
                <Route path="/">
                  <Main />
                </Route>
              </Switch>
            </Router>
          </MessageContext.Provider>
        </ClientContext.Provider>
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
}