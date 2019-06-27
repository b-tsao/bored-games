import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {
  AppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  Menu as MenuIcon
} from '@material-ui/icons';
import ActionBar from './ActionBar';
import SearchBar from './SearchBar';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    }
  }
}));

export default function NavBar(props) {
  const classes = useStyles();
  
  return (
    <AppBar className={props.className} position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="Open drawer"
          onClick={props.toggleDrawer}>
          <MenuIcon />
        </IconButton>
        <Typography className={classes.title} variant="h6" noWrap>
          Board Games
        </Typography>
        <SearchBar />
        <div className={classes.grow} />
        <ActionBar />
      </Toolbar>
    </AppBar>
  );
}