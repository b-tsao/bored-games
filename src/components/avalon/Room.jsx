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
  Card,
  CardActionArea,
  Checkbox,
  Container,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Hidden,
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
  KeyboardArrowRight,
  StarBorder as StarIcon
} from '@material-ui/icons';
import NameModal from '../landing/games/NameModal';
import ConnectModal from '../landing/ConnectModal';
import MessageModal from '../landing/MessageModal';

import {
  ClientContext,
  MainDisplayContext
} from '../../Contexts';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto'
  },
  container: {
    paddingLeft: 0,
    paddingRight: 0
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
      <Toolbar className={classes.toolbar}>
        <div className={classes.title}>
          <Hidden xsDown>
            <Typography variant="h6" id="tableTitle">
              Spectators: {spectators.length}
            </Typography>
          </Hidden>
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

function ActionMenu({disabled, player}) {
  const [client, setClient] = useContext(ClientContext);
  
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState(null);
  const [messageState, setMessageState] = useState({
    status: '',
    message: ''
  });
  
  const handleMessageClose = () => {
    setMessageState({status: '', message: ''});
  };
  
  const isActionMenuOpen = Boolean(actionMenuAnchorEl);
  
  function handleActionMenuOpen(event) {
    setActionMenuAnchorEl(event.currentTarget);
  }
  
  function handleActionMenuClose() {
    setActionMenuAnchorEl(null);
  }
  
  const handleAction = (action) => {
    handleActionMenuClose();
    client.emit('hostAction', action, player.id, (err) => {
      if (err) {
        setMessageState({status: 'error', message: err});
      }
    });
  };
  
  return (
    <React.Fragment>
      <MessageModal
        open={!!messageState.message}
        title={messageState.status}
        message={messageState.message}
        onClose={handleMessageClose} />
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
          <MenuItem onClick={() => {handleAction('transferHost')}}>
            <IconButton
              aria-label="Transfer host"
              color="inherit">
              <TransferIcon />
            </IconButton>
            <p>Transfer Host</p>
          </MenuItem>
          <MenuItem onClick={() => {handleAction('kick')}}>
            <IconButton
              aria-label="Kick player"
              color="inherit">
              <KickIcon />
            </IconButton>
            <p>Kick</p>
          </MenuItem>
        </Menu>
      </div>
    </React.Fragment>
  );
}

const useStepStyles = makeStyles(theme => ({
  board: {
    position: 'relative',
    maxWidth: 400,
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing(4),
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    color: 'white',
    width: '100%'
  },
  img: {
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
    <div className={classes.board}>
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

const useExtraSettingsStyles = makeStyles(theme => ({
  extraSettings: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6) + 4
    }
  },
}));

function ExtraSettings({settings}) {
  const classes = useExtraSettingsStyles();
  
  const [state, setState] = React.useState({
    enableHistory: true,
    spectatorsSeeIdentity: false,
    evilClarivoyance: false
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  const {spectatorsSeeIdentity, enableHistory, evilClarivoyance} = state;
  return (
    <div className={classes.extraSettings}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Extra Settings</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={enableHistory} onChange={handleChange('enableHistory')} value="enableHistory" />}
            label="Enable history"
          />
          <FormControlLabel
            control={<Checkbox checked={spectatorsSeeIdentity} onChange={handleChange('spectatorsSeeIdentity')} value="spectatorsSeeIdentity" />}
            label="Enable spectators to see everyone’s identity"
          />
          <FormControlLabel
            control={
              <Checkbox checked={evilClarivoyance} onChange={handleChange('evilClarivoyance')} value="evilClarivoyance" />
            }
            label="Enable evil to see each other’s vote"
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}

const useCardStyles = makeStyles(theme => ({
  container: {
    paddingLeft: 0,
    paddingRight: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },
  card: {
    display: 'flex',
    maxWidth: 127.66,
    maxHeight: 199.05
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
    '&:hover': {
      opacity: 1.0,
      filter: 'alpha(opacity=100)'
    }
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    opacity: 1.0,
    filter: 'alpha(opacity=100)', /* For IE8 and earlier */
  }
}));

function CardGrid({settings}) {
  const classes = useCardStyles();
  
  const board = settings.selectedBoard;
  
  const handleSelect = (card) => {
    
  };
  
  return (
    <Container className={classes.container} maxWidth="md">
      <Paper square elevation={0} className={classes.header}>
        <Typography>Good ({settings.selectedCards.good.length}/{settings.maxPlayers - settings.boards[settings.selectedBoard].evils})</Typography>
      </Paper>
      <Grid container spacing={2}>
        {settings.cards.good.map((card, idx) => (
          <Grid item key={card.id}>
            <Card className={classes.card}>
              <CardActionArea onClick={() => {handleSelect(card)}}>
                <img
                  src={card.img}
                  alt={card.label}
                  className={settings.selectedCards.good.indexOf(idx) < 0 ?
                    classes.image : classes.selectedImage} />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper square elevation={0} className={classes.header}>
        <Typography>Evil ({settings.selectedCards.evil.length}/{settings.boards[settings.selectedBoard].evils})</Typography>
      </Paper>
      <Grid container spacing={2}>
        {settings.cards.evil.map((card, idx) => (
          <Grid item key={card.id}>
            <Card className={classes.card}>
              <CardActionArea
        onClick={() => {handleSelect(card)}}
        className={classes.action}>
                <img
                  src={card.img}
                  alt={card.label}
                  className={settings.selectedCards.evil.indexOf(idx) < 0 ?
                    classes.image : classes.selectedImage} />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
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
        <Container className={classes.container} maxWidth="sm">
          <Typography component="h1" variant="h6" align="center" color="textPrimary" gutterBottom>
            {room.data.game}
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
      <Container className={classes.container} maxWidth="md">
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
            <ExtraSettings settings={room.data.settings} />
            <CardGrid settings={room.data.settings} />
          </Grid>
        </TabContainer>}
      </Container>
      <Hidden xsDown>
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
      </Hidden>
    </React.Fragment>
  );
}

Room.propTypes = {
  room: PropTypes.object.isRequired
}