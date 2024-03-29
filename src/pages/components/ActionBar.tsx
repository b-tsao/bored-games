import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Zoom
} from '@material-ui/core';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  MoreVert as MoreIcon,
  Notifications as NotificationsIcon
} from '@material-ui/icons';

import { ThemeContext, ClientContext } from '../../Contexts';

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
    }
  }
}));

export default function ActionBar() {
  const [theme, toggleTheme] = React.useContext(ThemeContext);
  const [client] = useContext(ClientContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const classes = useStyles();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  function handleProfileMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleProfileMenuClose() {
    setAnchorEl(null);
    handleMobileMenuClose();
  }

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  const toggleThemeButton = (
    <IconButton
      aria-label="ThemeMode"
      color="inherit"
      onClick={toggleTheme}>
      {theme.palette.type === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );

  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}>
      <MenuItem onClick={handleProfileMenuClose}>Sign In</MenuItem>
    </Menu>
  );

  const mobileNotifications = client ?
    <MenuItem onClick={() => { }}>
      <IconButton
        aria-label="Show notifications"
        color="inherit">
        <Badge badgeContent={0} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <p>Notifications</p>
    </MenuItem > : null;

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}>
      <MenuItem onClick={() => { }}>
        <IconButton
          aria-label="Account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Sign In</p>
      </MenuItem>
      {mobileNotifications}
    </Menu>
  );

  return (
    <div>
      <div className={classes.desktop}>
        <Zoom in={!!client}>
          <IconButton
            aria-label="Show notifications"
            color="inherit">
            <Badge badgeContent={0} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Zoom>
        {toggleThemeButton}
        <IconButton
          edge="end"
          aria-label="Account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit">
          <AccountCircle />
        </IconButton>
      </div>
      <div className={classes.mobile}>
        {toggleThemeButton}
        <IconButton
          aria-label="Show more"
          aria-controls={mobileMenuId}
          aria-haspopup="true"
          onClick={handleMobileMenuOpen}
          color="inherit">
          <MoreIcon />
        </IconButton>
      </div>
      {renderMobileMenu}
      {renderProfileMenu}
    </div >
  );
}