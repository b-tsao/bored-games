import React, {useState, useEffect, useContext} from 'react';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';
import deepExtend from 'deep-extend';
import {
  makeStyles,
  useTheme
} from '@material-ui/core/styles';

import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  MobileStepper,
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
  Row,
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
  Person as HostIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@material-ui/icons';
import NameModal from '../landing/games/NameModal';
import ConnectModal from '../landing/ConnectModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
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
    padding: theme.spacing(2),
  },
}));

function TabContainer({children, dir}) {
  return (
    <Typography
      component="div"
      dir={dir}
      style={{padding: 8 * 3}}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
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
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
    flex: '0 0 auto',
  },
}));

const ActionToolbar = props => {
  const {
    self,
    maxPlayers,
    players,
    spectators
  } = props;
  
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [openNameModal, setOpenNameModal] = useState(false);
  const [connectState, setConnectState] = useState({
    data: null,
    event: 'joinGame',
    connect: false
  });
  
  const classes = useToolbarStyles();
  
  const setPlayerName = (name) => {
    setConnectState({
      data: name,
      event: 'joinGame',
      connect: true
    });
  };
  
  const handleJoin = () => {
    setOpenNameModal(true);
  };
  
  const handleNameModalClose = () => {
    setOpenNameModal(false);
  };
  
  const handleComplete = () => {
    setConnectState(prevState => {
      return {...prevState, connect: false};
    });
    handleNameModalClose();
  };
  
  const handleConnectClose = () => {
    setConnectState(prevState => {
      return {...prevState, connect: false};
    });
  };
  
  const handleSpectate = () => {
    setConnectState({
      data: null,
      event: 'joinRoom',
      connect: true
    });
  };
  
  const handleLeave = () => {
    client.disconnect();
    setClient(null);
    setMainDisplay('home');
  };

  const startDisabled = self && self.host && players.length === maxPlayers;
  
  return (
    <React.Fragment>
      <ConnectModal
        connect={connectState.connect}
        client={client}
        event={connectState.event}
        data={connectState.data}
        onComplete={handleComplete}
        onClose={handleConnectClose} />
      <NameModal
        open={openNameModal}
        handleJoin={setPlayerName}
        handleClose={handleNameModalClose} />
      <Toolbar className={classes.root}>
        <div className={classes.title}>
          <Typography variant="h6" id="tableTitle">
            Spectators: {spectators.length}
          </Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          <Tooltip title="Leave Room" placement="top">
            <div>
              <IconButton
                onClick={handleLeave}
                aria-label="Leave Room">
                <LeaveIcon />
              </IconButton>
            </div>
          </Tooltip>
          {self ?
            <Tooltip title="Spectate Game" placement="top">
              <div>
                <IconButton
                  onClick={handleSpectate}
                  aria-label="Spectate Game">
                  <SpectateIcon />
                </IconButton>
              </div>
            </Tooltip> :
            <Tooltip title="Join Game" placement="top">
              <div>
                <IconButton
                  disabled={players.length >= maxPlayers}
                  onClick={handleJoin}
                  aria-label="Join Game">
                  <JoinIcon />
                </IconButton>
              </div>
            </Tooltip>
          }
          <Tooltip title="Start Game" placement="top">
            <div>
              <IconButton
                disabled
                onClick={null}
                aria-label="Start Game">
                <StartIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
      </Toolbar>
    </React.Fragment>
  );
};

function PlayersTable({self, maxPlayers, players}) {
  const classes = useStyles();
  
  const rows = [...players];
  while (rows.length < maxPlayers) {
    rows.push({host: false, name: ''});
  }

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Host</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align="right">Action</TableCell>
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
              <TableCell component="th" scope="row">
                {player.name}
              </TableCell>
              <TableCell align="right">
                {player.name ? 
                  <ActionMenu disabled={!self || !self.host || player.id === self.id} /> : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ActionMenu({disabled}) {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState(null);
  
  const isActionMenuOpen = Boolean(actionMenuAnchorEl);
  
  function handleActionMenuOpen(event) {
    setActionMenuAnchorEl(event.currentTarget);
  }
  
  function handleActionMenuClose() {
    setActionMenuAnchorEl(null);
  }
  
  return (
    <div>
      <IconButton
        aria-label="Show more"
        aria-controls="action-menu"
        aria-haspopup="true"
        onClick={handleActionMenuOpen}
        disabled={disabled}
        color="inherit">
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={actionMenuAnchorEl}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        id="action-menu"
        keepMounted
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        open={isActionMenuOpen}
        onClose={handleActionMenuClose}>
        <MenuItem onClick={null}>
          <IconButton
            aria-label="Transfer host"
            color="inherit">
            <TransferIcon />
          </IconButton>
          <p>Transfer Host</p>
        </MenuItem>
        <MenuItem onClick={null}>
          <IconButton
            aria-label="Kick player"
            color="inherit">
            <KickIcon />
          </IconButton>
          <p>Kick</p>
        </MenuItem>
      </Menu>
    </div>
  );
}

const useStepStyles = makeStyles(theme => ({
  root: {
    maxWidth: 400,
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: 255,
    maxWidth: 400,
    overflow: 'hidden',
    display: 'block',
    width: '100%',
  },
}));

export function BoardStepper({settings}) {
  const classes = useStepStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(settings.selectedBoard);
  const maxSteps = settings.boards.length;

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }

  return (
    <div className={classes.root}>
      <Paper square elevation={0} className={classes.header}>
        <Typography>{settings.boards[activeStep].label}</Typography>
      </Paper>
      <img
        className={classes.img}
        src={settings.boards[activeStep].img}
        alt={settings.boards[activeStep].label}
      />
      <MobileStepper
        steps={maxSteps}
        position="static"
        variant="text"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      />
    </div>
  );
}

export default function Room(props) {
  const [client, setClient] = useContext(ClientContext);
  
  const [room, setRoom] = useState(props.room);
  const [tabValue, setTabValue] = useState(0);
  
  const classes = useStyles();
  const theme = useTheme();

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }
  
  useEffect(() => {
    const handler = roomChanges => {
      setRoom({...deepExtend(room, roomChanges)});
    };
    
    client.on('change', handler);
    
    return () => {
      client.off('change', handler);
    };
  }, [room]);

  let self = null;
  for (const player of room.data.players) {
    if (player.id === client.id) {
      self = player;
      break;
    }
  }
  
  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.heroContent}>
        <Container maxWidth="sm">
          <Typography component="h1" variant="h6" align="center" color="textPrimary" gutterBottom>
            The Resistance: Avalon
          </Typography>
          <Typography variant="overline" display="block" align="center" color="textSecondary" paragraph>
            Room Key: {room.key}
          </Typography>
          <div className={classes.tabs}>
            <AppBar position="static" color="default">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth">
                <Tab label="Lobby" />
                <Tab label="Settings" />
              </Tabs>
            </AppBar>
          </div>
        </Container>
      </div>
      <Container maxWidth="md">
        {tabValue === 0 && <TabContainer dir={theme.direction}>
          <ActionToolbar
            self={self}
            spectators={room.data.spectators}
            maxPlayers={room.data.settings.maxPlayers}
            players={room.data.players} />
          <PlayersTable
            self={self}
            maxPlayers={room.data.settings.maxPlayers}
            players={room.data.players} />
        </TabContainer>}
        {tabValue === 1 && <TabContainer dir={theme.direction}>
          <Grid container spacing={4}>
            <BoardStepper settings={room.data.settings} />
          </Grid>
        </TabContainer>}
      </Container>
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          Bored Games
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Feeling bored? Play board games!
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          align="center">
          Built with Boredom
        </Typography>
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}

Room.propTypes = {
  room: PropTypes.object.isRequired
}