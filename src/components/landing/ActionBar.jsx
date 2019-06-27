import React, {useState, useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {
  IconButton,
  Menu,
  MenuItem
} from '@material-ui/core';
import {
  AccountCircle,
  Menu as MenuIcon,
  MoreVert as MoreIcon
} from '@material-ui/icons';

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
  const classes = useStyles();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  
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
  
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}>
      <MenuItem onClick={null}>
        <IconButton
          aria-label="Account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Sign In</p>
      </MenuItem>
    </Menu>
  );
  
  return (
    <div>
      <div className={classes.desktop}>
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
    </div>
  );
}