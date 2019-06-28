import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';

import {
  Badge,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';

import {
  CastConnected as GameIcon,
  Widgets as GamesIcon,
  Home as HomeIcon,
  Shop as ShopIcon
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  }
}));

export default function SideBar(props) {
  const classes = useStyles();
  
  return (
    <Drawer
      variant="permanent"
      className={props.className}
      classes={props.classes}
      open={props.open}>
      <div className={classes.toolbar} />
      <List>
        <ListItem
          button
          onClick={e => props.setDisplay('Home')}
          key='Home'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
        <ListItem
          button
          onClick={e => props.setDisplay('Games')}
          key='Games'>
          <ListItemIcon>
            <GamesIcon />
          </ListItemIcon>
          <ListItemText primary='Library' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={e => props.setDisplay('Shop')}
          key='Shop'>
          <ListItemIcon>
            <ShopIcon />
          </ListItemIcon>
          <ListItemText primary='Shop' />
        </ListItem>
        {props.gameName ?
          <ListItem
            button
            onClick={e => props.setDisplay(props.gameName)}
            key={props.gameName}>
            <ListItemIcon>
              <Badge badgeContent={0} color="secondary">
                <GameIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={props.gameName} />
          </ListItem> : null}
        </List>
    </Drawer>
  );
}

SideBar.propTypes = {
  setDisplay: PropTypes.func.isRequired,
  gameName: PropTypes.string
}