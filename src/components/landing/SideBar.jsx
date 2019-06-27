import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';

import {
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';

import {
  Games as GamesIcon,
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
        <ListItem button onClick={e => props.setDisplay('Home')} key={'Home'}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={'Home'} />
        </ListItem>
        <ListItem button onClick={e => props.setDisplay('Games')} key={'Games'}>
          <ListItemIcon>
            <GamesIcon />
          </ListItemIcon>
          <ListItemText primary={'Library'} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={e => props.setDisplay('Shop')} key={'Shop'}>
          <ListItemIcon>
            <ShopIcon />
          </ListItemIcon>
          <ListItemText primary={'Shop'} />
        </ListItem>
      </List>
    </Drawer>
  );
}

SideBar.propTypes = {
  setDisplay: PropTypes.func.isRequired
}