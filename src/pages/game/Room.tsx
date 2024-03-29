import React, { useState, useRef, useContext } from 'react';
import {
  makeStyles,
  useTheme
} from '@material-ui/core/styles';

import {
  AppBar,
  Container,
  Grid,
  Hidden,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  Zoom
} from '@material-ui/core';
import {
  RemoveCircle as KickIcon,
  PersonAdd as JoinIcon,
  Cancel as LeaveIcon,
  PlayCircleOutline as StartIcon,
  RemoveCircleOutline as SpectateIcon,
  Sync as TransferIcon,
  MoreVert as MoreIcon,
  Person as HostIcon
} from '@material-ui/icons';
import NameModal from './components/NameModal';

import { ClientContext } from '../../Contexts';
import Settings from './Settings';

function TabContainer({ children, dir }) {
  return (
    <Typography
      component='div'
      dir={dir}
      style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

const useToolbarStyles = makeStyles(theme => ({
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    display: 'flex',
    color: theme.palette.text.secondary,
  },
  title: {
    display: 'flex',
    flex: '0 0 auto',
  }
}));

const ActionToolbar = ({ self, room }) => {
  const { ctx } = room;

  const [client] = useContext(ClientContext);

  const [openNameModal, setOpenNameModal] = useState(false);

  const classes = useToolbarStyles();

  const setPlayerName = (name) => {
    client.emit('joinGame', name);
    handleNameModalClose();
  };

  const handleJoin = () => {
    setOpenNameModal(true);
  };

  const handleNameModalClose = () => {
    setOpenNameModal(false);
  };

  const handleSpectate = () => {
    client.emit('joinSpectate');
  };

  const handleLeave = () => {
    client.emit('leave');
  };

  const handleStart = () => {
    client.emit('start');
  };

  const hostCheck = self && self.host;

  let startDisableReason: string | null = null;
  if (!hostCheck) {
    startDisableReason = 'Waiting for host to start';
  }

  return (
    <React.Fragment>
      <NameModal
        open={openNameModal}
        handleJoin={setPlayerName}
        handleClose={handleNameModalClose} />
      <Toolbar className={classes.toolbar}>
        <Hidden xsDown>
          <div className={classes.title}>
            <Typography variant='h6' id='tableTitle'>
              Spectators: {Object.keys(ctx.spectators).length}
            </Typography>
          </div>
          <div className={classes.spacer} />
          <div className={classes.title}>
            <Typography variant='h6' id='tableTitle'>
              Players: {Object.keys(ctx.players).length}
            </Typography>
          </div>
        </Hidden>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          <Tooltip title='Leave Room' placement='top'>
            <div>
              <IconButton
                onClick={handleLeave}
                aria-label='Leave Room'>
                <LeaveIcon />
              </IconButton>
            </div>
          </Tooltip>
          {self ?
            <Tooltip title='Spectate Game' placement='top'>
              <div>
                <IconButton
                  onClick={handleSpectate}
                  aria-label='Spectate Game'>
                  <SpectateIcon />
                </IconButton>
              </div>
            </Tooltip> :
            <Tooltip title='Join Game' placement='top'>
              <div>
                <IconButton
                  onClick={handleJoin}
                  aria-label='Join Game'>
                  <JoinIcon />
                </IconButton>
              </div>
            </Tooltip>
          }
          <Tooltip title={startDisableReason ? startDisableReason : 'Start Game'} placement='top'>
            <div>
              <IconButton
                disabled={!!startDisableReason}
                onClick={handleStart}
                aria-label='Start Game'>
                <StartIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
      </Toolbar>
    </React.Fragment>
  );
};

const usePlayersTableStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto'
  },
  disconnected: {
    color: 'rgba(0, 0, 0, 0.54)'
  }
}));

function PlayersTable({ self, room }) {
  const classes = usePlayersTableStyles();

  const players = room.ctx.players;
  const rows: any[] = [];
  for (const id in players) {
    rows.push({ id, ...players[id] });
  }
  for (let i = rows.length; i < room.ctx.settings.numPlayers; i++) {
    rows.push({ host: false, name: '', client: {} });
  }

  return (
    <Paper className={classes.root}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Host</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align='right'>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((player, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Zoom in={player.host}>
                  <HostIcon />
                </Zoom>
              </TableCell>
              <TableCell
                component='th'
                scope='row'
                className={player.client.status === 'disconnected' ? classes.disconnected : undefined}>
                {player.name}
              </TableCell>
              <TableCell align='right'>
                {player.name ?
                  <ActionMenu
                    disabled={!self || !self.host || player.id === self.id}
                    player={player} /> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ActionMenu({ disabled, player }) {
  const [client] = useContext(ClientContext);

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState(null);

  const isActionMenuOpen = Boolean(actionMenuAnchorEl);

  function handleActionMenuOpen(event) {
    setActionMenuAnchorEl(event.currentTarget);
  }

  function handleActionMenuClose() {
    setActionMenuAnchorEl(null);
  }

  const handleAction = (action) => {
    handleActionMenuClose();
    client.emit('hostAction', action, player.id);
  };

  return (
    <React.Fragment>
      <div>
        <IconButton
          aria-label='Show more'
          aria-controls='action-menu'
          aria-haspopup='true'
          onClick={handleActionMenuOpen}
          disabled={disabled}
          color='inherit'>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={actionMenuAnchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          id='action-menu'
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={isActionMenuOpen}
          onClose={handleActionMenuClose}>
          <MenuItem onClick={() => { handleAction('transferHost') }}>
            <IconButton
              aria-label='Transfer host'
              color='inherit'>
              <TransferIcon />
            </IconButton>
            <p>Transfer Host</p>
          </MenuItem>
          <MenuItem onClick={() => { handleAction('kick') }}>
            <IconButton
              aria-label='Kick player'
              color='inherit'>
              <KickIcon />
            </IconButton>
            <p>Kick</p>
          </MenuItem>
        </Menu>
      </div>
    </React.Fragment>
  );
}

const useStyles = makeStyles(theme => ({
  container: {
    paddingLeft: 0,
    paddingRight: 0
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column'
  },
  padding: {
    padding: theme.spacing(2)
  },
  tabs: {
    backgroundColor: theme.palette.background.paper
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 0, 0),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2)
  },
  url: {
    display: 'flex',
    justifyContent: 'center'
  }
}));

export default function Room({ room, self }) {
  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);

  const classes = useStyles();
  const theme = useTheme();

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  function highlightAll(e) {
    textAreaRef.current.select();
  }

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    // This will prevent the whole text area selected.
    // e.target.focus();
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 1000);
  };

  return (
    <React.Fragment>
      <div className={classes.heroContent}>
        <Container className={classes.container} maxWidth='sm'>
          <Typography component='h1' variant='h6' align='center' color='textPrimary' gutterBottom>
            {room.ctx.title}
          </Typography>
          <Typography variant='overline' display='block' align='center' color='textSecondary'>
            Room Key: {room.ctx.key}
          </Typography>
          <div className={classes.url}>
            <form>
              <textarea
                ref={textAreaRef}
                readOnly
                onFocus={highlightAll}
                style={{ resize: 'none' }}
                rows={1}
                cols={window.location.href.length - 2}
                value={window.location.href}
              />
            </form>
            {
              /* Logical shortcut for only displaying the 
                 button if the copy command exists */
              document.queryCommandSupported('copy') &&
              <div style={{ 'color': 'green' }}>
                <button onClick={copyToClipboard}>Copy</button>
                {copySuccess}
              </div>
            }
          </div>
          <div className={classes.tabs}>
            <AppBar position='static' color='default'>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor='primary'
                textColor='primary'
                variant='fullWidth'>
                <Tab label='Lobby' />
                <Tab label='Settings' />
              </Tabs>
            </AppBar>
          </div>
        </Container>
      </div>
      <Container className={classes.container} maxWidth='lg'>
        {tabValue === 0 &&
          <TabContainer dir={theme.direction}>
            <ActionToolbar
              self={self}
              room={room} />
            <PlayersTable
              self={self}
              room={room} />
          </TabContainer>}
        {tabValue === 1 &&
          <TabContainer dir={theme.direction}>
            <Settings 
              self={self}
              room={room}
            />
          </TabContainer>}
      </Container>
      <Hidden xsDown>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant='h6' align='center' gutterBottom>
            Bored Games
          </Typography>
          <Typography variant='subtitle1' align='center' color='textSecondary' component='p'>
            Feeling bored? Play board games!
          </Typography>
          <Typography
            variant='body2'
            color='textSecondary'
            align='center'>
            Built with Boredom
          </Typography>
        </footer>
        {/* End footer */}
      </Hidden>
    </React.Fragment>
  );
}