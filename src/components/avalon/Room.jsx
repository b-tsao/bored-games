import React, {useState, useContext} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
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
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
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
  linkButton: {
    textDecoration: 'none',
    color: 'inherit'
  }
}));

const ActionToolbar = props => {
  const {
    self,
    roomKey,
    maxPlayers,
    players,
    spectators,
    settings
  } = props;
  
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
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
    client.disconnect();
    setClient(null);
    setMainDisplay('home');
  };
  
  const handleStart = () => {
    client.emit('game', 'start');
  };
  
  const board = settings.selectedBoard;
  const maxEvils = settings.static.boards[board].evils;
  const maxGoods = settings.maxPlayers - maxEvils;
  const evils = settings.selectedCards.evil.length;
  const goods = settings.selectedCards.good.length;

  const hostCheck = self && self.host;
  // const playersCheck = players.length === maxPlayers;
  const playersCheck = true; // DEBUG purpose
  const cardsCheck = goods === maxGoods && evils === maxEvils;
  
  let startDisableReason = null;
  if (!hostCheck) {
    startDisableReason = "Waiting for host to start";
  } else if (!playersCheck) {
    startDisableReason = "Invalid player count";
  } else if (!cardsCheck) {
    startDisableReason = "Invalid character card count";
  }
  
  return (
    <React.Fragment>
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
          <Tooltip title={startDisableReason ? startDisableReason : "Start Game"} placement="top">
            <div>
              <IconButton
                disabled={!!startDisableReason}
                onClick={handleStart}
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
      <Table>
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
    maxWidth: '100vw',
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
    overflow: 'hidden',
    display: 'block',
    width: '100%',
  },
}));

export function BoardStepper({self, settings}) {
  const [client] = useContext(ClientContext);
  
  const classes = useStepStyles();
  const theme = useTheme();
  
  const activeStep = settings.selectedBoard;
  const maxSteps = settings.static.boards.length;
  
  function handleNext() {
    client.emit('settings', {selectedBoard: activeStep + 1});
  }

  function handleBack() {
    client.emit('settings', {selectedBoard: activeStep - 1});
  }

  return (
    <React.Fragment>
      <div className={classes.board}>
        <Paper square elevation={0} className={classes.header}>
          <Typography>{settings.static.boards[activeStep].label}</Typography>
        </Paper>
        <img
          className={classes.img}
          src={settings.static.boards[activeStep].img}
          alt={settings.static.boards[activeStep].label}
        />
        <MobileStepper
          steps={maxSteps}
          position="static"
          variant="text"
          activeStep={activeStep}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={!self || !self.host || activeStep === maxSteps - 1}>
              Next
              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={!self || !self.host || activeStep === 0}>
              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              Back
            </Button>
          }
        />
      </div>
    </React.Fragment>
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

function ExtraSettings({self, settings}) {
  const [client] = useContext(ClientContext);
  
  const classes = useExtraSettingsStyles();
        
  const handleChange = name => event => {
    client.emit('settings', {extra: {[name]: event.target.checked}});
  };
  
  const {enableHistory, spectatorsSeeIdentity, evilClarivoyance} = settings.extra;
  const error = !self || !self.host;
  
  return (
    <React.Fragment>
      <div className={classes.extraSettings}>
        <FormControl
          error={error}
          disabled={error}
          component="fieldset"
          className={classes.formControl}>
          {error ?
            <FormLabel component="legend">
              Only host can make changes to settings
            </FormLabel> : null}
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
    </React.Fragment>
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
    maxHeight: 198.77
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    opacity: 1.0,
    filter: 'alpha(opacity=100)', /* For IE8 and earlier */
  }
}));

function CardGrid({self, settings}) {
  const [client] = useContext(ClientContext);
  
  const classes = useCardStyles();
  
  const handleSelect = (side, cardIdx) => {
    let selectedCards = settings.selectedCards[side];
    const idx = selectedCards.indexOf(cardIdx);
    if (idx < 0) {
      selectedCards = [...selectedCards, cardIdx];
    } else {
      selectedCards = [...selectedCards.slice(0, idx), ...selectedCards.slice(idx + 1)];
    }
    client.emit('settings', {selectedCards: {[side]: selectedCards}});
  };
  
  const board = settings.selectedBoard;
  const maxEvils = settings.static.boards[board].evils;
  const maxGoods = settings.maxPlayers - maxEvils;
  const evils = settings.selectedCards.evil.length;
  const goods = settings.selectedCards.good.length;
  const disabled = !self || !self.host;
  
  return (
    <React.Fragment>
      <Container className={classes.container} maxWidth="md">
        <Paper square elevation={0} className={classes.header}>
          <Typography>Good ({goods}/{maxGoods})</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.good.map((card, idx) => {
            const selectedCard = settings.selectedCards.good.indexOf(idx) >= 0;
            const disabledGood = disabled || (goods >= maxGoods && !selectedCard);
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea
                    disabled={disabledGood}
                    onClick={() => {handleSelect('good', idx)}}>
                    <img
                      src={card.img}
                      alt={card.label}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>Evil ({evils}/{maxEvils})</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.evil.map((card, idx) => {
            const selectedCard = settings.selectedCards.evil.indexOf(idx) >= 0;
            const disabledEvil = disabled || (evils >= maxEvils && !selectedCard);
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea
                    disabled={disabledEvil}
                    onClick={() => {handleSelect('evil', idx)}}>
                    <img
                      src={card.img}
                      alt={card.label}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </React.Fragment>
  );
}

export default function Room({room, self}) {
  const [tabValue, setTabValue] = useState(0);
  
  const classes = useStyles();
  const theme = useTheme();

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }
  
  const paddedPaper = clsx(classes.paper, classes.padding);
  
  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.heroContent}>
        <Container className={classes.container} maxWidth="sm">
          <Typography component="h1" variant="h6" align="center" color="textPrimary" gutterBottom>
            {room.game.title}
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
      <Container className={classes.container} maxWidth="lg">
        {tabValue === 0 &&
          <TabContainer dir={theme.direction}>
            <ActionToolbar
              self={self}
              spectators={room.spectators}
              maxPlayers={room.game.settings.maxPlayers}
              players={room.players}
              settings={room.game.settings} />
            <PlayersTable
              self={self}
              maxPlayers={room.game.settings.maxPlayers}
              players={room.players} />
          </TabContainer>}
        {tabValue === 1 &&
          <TabContainer dir={theme.direction}>
            <Grid container spacing={3}>
              {/* Board Stepper */}
              <Grid item xs={12} md={6} lg={6}>
                <Paper className={classes.paper}>
                  <BoardStepper self={self} settings={room.game.settings} />
                </Paper>
              </Grid>
              {/* Extra Settings */}
              <Grid item xs={12} md={6} lg={6}>
                <Paper className={paddedPaper}>
                  <ExtraSettings self={self} settings={room.game.settings} />
                </Paper>
              </Grid>
              {/* Cards */}
              <CardGrid self={self} settings={room.game.settings} />
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