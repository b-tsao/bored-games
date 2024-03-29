import React, { useEffect } from 'react';
import { Switch, Route } from "react-router-dom";
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import FloatingActions from './components/FloatingActions';

import HelloWorld from './welcome/HelloWorld';
import Games from './games/Games';
import GameRoom from './game/GameRoom';
import Maintenance from './Maintenance';
import { useMediaQuery } from '@material-ui/core';

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
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

export default function Main() {
  const classes = useStyles();

  const isSmallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('xs'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useEffect(() => {
    setDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const toggleDrawer = (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
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
        open={drawerOpen} />
      <FloatingActions
        className={classes.fab} />
      <main className={classes.content}>
        <div className={classes.toolbar} />

        <Switch>
          <Route path='/games'>
            <Games />
          </Route>
          <Route path='/store'>
            <Maintenance />
          </Route>
          <Route path='/room/:id'>
            <GameRoom />
          </Route>
          <Route path='/'>
            <HelloWorld />
          </Route>
        </Switch>
      </main>
    </div>
  );
}