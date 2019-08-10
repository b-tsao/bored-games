import React, {useState, useEffect, useContext} from 'react';
import clsx from 'clsx';
import {Link} from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';
import deepExtend from 'deep-extend';
import {
  makeStyles,
  useTheme
} from '@material-ui/core/styles';

import {
  Button,
  Card,
  CardActionArea,
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
  KeyboardArrowRight,
  StarBorder as StarIcon
} from '@material-ui/icons';
import MessageModal from '../landing/MessageModal';

import {ClientContext} from '../../Contexts';

const useStyles = makeStyles(theme => ({
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  paper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  padding: {
    padding: theme.spacing(2)
  }
}));

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
  const {self} = props;
  
  const [client, setClient] = useContext(ClientContext);
  
  const classes = useToolbarStyles();
  
  const handleLeave = () => {
    client.disconnect();
    setClient(null);
  };

  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        <div className={classes.title}>
          <Typography variant="h6" id="tableTitle">
            Under Construction
          </Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          <Tooltip title="Leave Game" placement="top">
            <div>
              <Link to="/" onClick={handleLeave} className={classes.linkButton}>
                <LeaveIcon />
              </Link>
            </div>
          </Tooltip>
        </div>
      </Toolbar>
    </React.Fragment>
  );
};

function PlayersTable({self, players}) {
  const classes = useStyles();
  
  return (
    <React.Fragment>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player, idx) => (
            <TableRow key={idx}>
              <TableCell component="th" scope="row">
                {player.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

const useBoardStyles = makeStyles(theme => ({
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

export function Board({settings}) {
  
  const classes = useBoardStyles();

  return (
    <React.Fragment>
      <div className={classes.board}>
        <img
          className={classes.img}
          src={settings.boards[settings.selectedBoard].img}
          alt={settings.boards[settings.selectedBoard].label}
        />
      </div>
    </React.Fragment>
  );
}

export default function Game(props) {
  const [client] = useContext(ClientContext);
  
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
  for (const player of room.game.players) {
    if (player.id === client.id) {
      self = player;
      break;
    }
  }
  
  const paddedPaper = clsx(classes.paper, classes.padding);
  
  return (
    <main className={classes.content}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          {/* Board */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={classes.paper}>
              <Board settings={room.game.settings} />
            </Paper>
          </Grid>
          {/* Actions */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={paddedPaper}>
              <ActionToolbar
                self={self} />
            </Paper>
          </Grid>
          {/* Players */}
          <Grid item xs={12}>
            <Paper className={paddedPaper}>
              <PlayersTable
                self={self}
                players={room.game.players} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

Game.propTypes = {
  room: PropTypes.object.isRequired
}