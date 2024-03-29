import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import {
  Badge,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Zoom
} from '@material-ui/core';

import {
  Link as GameIcon,
  Widgets as GamesIcon,
  Home as HomeIcon,
  Shop as StoreIcon
} from '@material-ui/icons';

import { ClientContext } from '../../Contexts';

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
  const history = useHistory();

  const [client] = useContext(ClientContext);

  const classes = useStyles();

  return (
    <Drawer
      variant='permanent'
      className={props.className}
      classes={props.classes}
      open={props.open}>
      <div className={classes.toolbar} />
      <List>
        <ListItem
          button
          onClick={e => history.push('/games')}
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
          onClick={e => history.push('/')}
          key='Home'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
        <ListItem
          button
          onClick={e => history.push('/store')}
          key='Store'>
          <ListItemIcon>
            <StoreIcon />
          </ListItemIcon>
          <ListItemText primary='Store' />
        </ListItem>
        <Zoom in={!!client}>
          <ListItem
            button
            onClick={e => history.push(`/room/${client.roomKey}`)}
            key='Game'>
            <ListItemIcon>
              <Badge
                invisible={true}
                variant='dot'
                color='secondary'>
                <GameIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary='Game' />
          </ListItem>
        </Zoom>
      </List>
    </Drawer>
  );
}

SideBar.propTypes = {
  open: PropTypes.bool,
  className: PropTypes.string,
  classes: PropTypes.object
}