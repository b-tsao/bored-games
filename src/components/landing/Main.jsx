import React from 'react';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core/styles';

import {CssBaseline} from '@material-ui/core';
import NavBar from './NavBar';
import SideBar from './SideBar';
import FloatingActions from './FloatingActions';

import HelloWorld from './HelloWorld';
import Games from './games/Games';
import GameRoom from './games/GameRoom';
import Maintenance from './Maintenance';

import {MainDisplayContext} from '../../Contexts';

const mobileDrawerWidth = 150;
const drawerWidth = 225;
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawer: {
    width: mobileDrawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth
    },
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    width: mobileDrawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
  },
  drawerClose: {
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7) + 4,
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  content: {
    zIndex: 0,
    flexGrow: 1
  },
  fab: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

export default function Main() {
  const classes = useStyles();
  
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mainDisplay, setMainDisplay] = React.useState('home');
  const [gameName, setGameName] = React.useState(null);
  
  const toggleDrawer = (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(!drawerOpen);
  };

  const display = (() => {
    switch (mainDisplay.toLowerCase()) {
      case 'home':
        return <HelloWorld />;
      case 'games':
        return <Games />;
      case 'gameroom':
        return <GameRoom />;
      default:
        return <Maintenance />;
    }
  })();
  
  return (
    <div className={classes.root}>
      <MainDisplayContext.Provider
    value={[mainDisplay, setMainDisplay]}>
        <CssBaseline />
        <NavBar
          className={classes.appBar}
          toggleDrawer={toggleDrawer} />
        <SideBar
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: drawerOpen,
            [classes.drawerClose]: !drawerOpen,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: drawerOpen,
              [classes.drawerClose]: !drawerOpen,
            }),
          }}
          open={drawerOpen}
          setDisplay={setMainDisplay}
          gameName={gameName} />
        <FloatingActions
          className={classes.fab} />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {display}
        </main>
      </MainDisplayContext.Provider>
    </div>
  );
}