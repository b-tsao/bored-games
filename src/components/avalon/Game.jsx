import React, {useState, useContext} from 'react';
import clsx from 'clsx';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  makeStyles,
  useTheme
} from '@material-ui/core/styles';

import {
  Badge,
  Button,
  Card,
  CardActionArea,
  Container,
  Grid,
  Hidden,
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
  HowToVote as VoteIcon,
  Cancel as LeaveIcon,
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
  },
  margin: {
    margin: theme.spacing(1)
  },
  disconnected: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  card: {
    marginRight: 'auto',
    maxWidth: 40
  },
  disconnectedImg: {
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
  },
  img: {
    overflow: 'hidden',
    display: 'block',
    width: '100%'
  },
  evil: {
    transition: 'all .2s ease-in',
    backgroundColor: '#df92a3'
  },
  merlin: {
    transition: 'all .2s ease-in',
    backgroundColor: '#b3d7fa'
  },
  normal: {
    transition: 'all .2s ease-in',
    backgroundColor: 'inherit'
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
  },
  card: {
    display: 'flex',
    maxWidth: 127.66,
    maxHeight: 198.77,
    margin: 'auto',
    perspective: '1000px',
    boxShadow: 'none',
  },
  voteCard: {
    display: 'flex',
    maxWidth: 82.75,
    maxHeight: 105.25,
    margin: 'auto'
  },
  cardActionArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    boxShadow:'0 4px 8px 0 rgba(0,0,0,0.2)'
  },
  reveal: {
    transform: 'rotateY(180deg)'
  },
  front: {
    backgroundColor: '#bbb',
    color: 'black',
    '&, $back': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden'
    }
  },
  back: {
    backgroundColor: '#2980b9',
    color: 'white',
    transform: 'rotateY(180deg)'
  },
  img: {
    overflow: 'hidden',
    display: 'block',
    width: '100%'
  },
  disabledImg: {
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
  },
}));

const ActionToolbar = ({game, self, power}) => {
  const [client, setClient] = useContext(ClientContext);
  
  const [reveal, setReveal] = power;
  
  const classes = useToolbarStyles();
  
  const handlePropose = () => {
    client.emit('game', 'propose');
  };
  
  const handleLeave = () => {
    client.disconnect();
    setClient(null);
  };
  
  const handleSelect = () => {
    setReveal(!reveal);
  };
  
  const handleVote = (vote) => {
    client.emit('game', 'vote', {vote});
  };

  const isLeader = self && self.id === game.state.players[game.state.leader].id;
  const proposePhase = game.state.phase === 'proposing';
  const selectedBoard = game.settings.static.boards[game.settings.selectedBoard];
  const currentMission = selectedBoard.missions[game.state.missions.length];
  const enableVote = isLeader && proposePhase && game.state.team.length === currentMission.team;
  
  const cardActionAreaClass = reveal ? clsx(classes.cardActionArea, classes.reveal) : classes.cardActionArea;
  
  const playerCard = self && self.card ? (
    <Card className={classes.card}>
      <CardActionArea
        className={cardActionAreaClass}
        onClick={handleSelect}>
        <div className={classes.front}>
          <img
            className={classes.img}
            src={game.settings.static.cards.cover.img}
            alt={game.settings.static.cards.cover.label} />
        </div>
        <div className={classes.back}>
          <img
            className={classes.img}
            src={game.settings.static.cards[self.card.side][self.card.idx].img}
            alt={game.settings.static.cards[self.card.side][self.card.idx].label} />
        </div>
      </CardActionArea>
    </Card>
  ) : null;
  
  const imgClass = game.state.phase !== 'voting' ? clsx(classes.img, classes.disabledImg) : classes.img;
  
  const approveVote = self && self.card ? (
    <Card className={classes.voteCard}>
      <CardActionArea
        disabled={game.state.phase !== 'voting'}
        className={classes.cardActionArea}
        onClick={() => {handleVote('approve')}}>
        <img
          className={imgClass}
          src={game.settings.static.vote.approve.img}
          alt={game.settings.static.vote.approve.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const rejectVote = self && self.card ? (
    <Card className={classes.voteCard}>
      <CardActionArea
        disabled={game.state.phase !== 'voting'}
        className={classes.cardActionArea}
        onClick={() => {handleVote('reject')}}>
        <img
          className={imgClass}
          src={game.settings.static.vote.reject.img}
          alt={game.settings.static.vote.reject.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const voteIcon = self ? (
    <Tooltip title="Vote" placement="top">
      <div>
        <IconButton
          disabled={!enableVote}
          onClick={handlePropose}
          aria-label="Vote">
          <Badge
            color="secondary"
            variant="dot"
            invisible={!enableVote}
            className={classes.margin}>
            <VoteIcon />
          </Badge>
        </IconButton>
      </div>
    </Tooltip>
  ) : null;

  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        <div className={classes.title}>
          <Typography variant="h6" id="tableTitle">
            {game.state.message}
          </Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          {voteIcon}
          <Tooltip title="Leave Game" placement="top">
            <div>
              <Link to="/" onClick={handleLeave} className={classes.linkButton}>
                <LeaveIcon />
              </Link>
            </div>
          </Tooltip>
        </div>
      </Toolbar>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={6} lg={6}>
            {playerCard}
          </Grid>
          <Grid item xs={6} md={6} lg={6}>
            <Grid container spacing={3}>
              <Grid item xs={6} md={6} lg={6}>
                {approveVote}
              </Grid>
              <Grid item xs={6} md={6} lg={6}>
                {rejectVote}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

function PlayersTable({game, self, power}) {
  const [client] = useContext(ClientContext);
  
  const classes = useStyles();

  const isLeader = self && self.id === game.state.players[game.state.leader].id;
  const proposePhase = game.state.phase === 'proposing';
  const canPropose = isLeader && proposePhase;
  
  const handleChoose = (event, playerId) => {
    if (canPropose) {
      client.emit('game', 'choose', {id: playerId});
    }
  };
  
  return (
    <React.Fragment>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Chosen</TableCell>
            <Hidden xsDown>
              <TableCell>M1</TableCell>
              <TableCell>M2</TableCell>
              <TableCell>M3</TableCell>
              <TableCell>M4</TableCell>
              <TableCell>M5</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {game.state.players.map((player, idx) => {
            let playerRowClass = classes.normal;
            if (power) {
              if (player.evil) {
                playerRowClass = classes.evil;
              } else if (player.merlin) {
                playerRowClass = classes.merlin;
              }
            }
            
            let playerCellClass = null;
            let imgClass = classes.img;
            if (!player.connected) {
              playerCellClass = classes.disconnected;
              imgClass = clsx(imgClass, classes.disconnectedImg);
            }
            
            let playerChosen = false;
            for (const chosen of game.state.team) {
              if (player.id === chosen) {
                playerChosen = true;
                break;
              }
            }
            
            const votes = [];
            for (const mission of game.state.missions) {
              for (const vote of mission.history[mission.history.length - 1].votes) {
                votes.push(
                  <TableCell key={player.id + '-vote'} component="th" scope="row">
                    <Zoom in={true}>
                      <Card className={classes.card}>
                        {vote[player.id] ?
                          <img
                            className={imgClass}
                            src={game.settings.static.vote.approve.img}
                            alt={game.settings.static.vote.approve.label} /> :
                          <img
                            className={imgClass}
                            src={game.settings.static.vote.reject.img}
                            alt={game.settings.static.vote.reject.label} />}
                      </Card>
                    </Zoom>
                  </TableCell>
                );
              }
            }
            
            for (const voter of game.state.votes) {
              if (player.id === voter) {
                votes.push(
                  <TableCell key={player.id + '-vote'} component="th" scope="row">
                    <Zoom in={true}>
                      <Card className={classes.card}>
                        <img
                          className={imgClass}
                          src={game.settings.static.vote.cover.img}
                          alt={game.settings.static.vote.cover.label} />
                      </Card>
                    </Zoom>
                  </TableCell>
                );
              }
            }
            
            return (
              <TableRow
                hover={canPropose}
                key={idx}
                onClick={e => handleChoose(e, player.id)}
                className={playerRowClass}>
                <TableCell className={playerCellClass} component="th" scope="row">
                  {player.name}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Zoom in={playerChosen}>
                    <Card className={classes.card}>
                      <img
                        className={imgClass}
                        src={game.settings.static.mission.chosen.img}
                        alt={game.settings.static.mission.chosen.label} />
                    </Card>
                  </Zoom>
                </TableCell>
                <Hidden xsDown>
                  {votes}
                </Hidden>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

const useBoardStyles = makeStyles(theme => ({
  board: {
    position: 'relative',
    maxWidth: '100vw',
    flexGrow: 1
  },
  round: {
    position: 'absolute',
    width: '8%',
    top: '56.7%',
    left: '14.5%'
  },
  rejects: {
    position: 'absolute',
    width: '11.6%',
    top: '78%',
    left: '5.2%'
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
    width: '100%'
  },
}));

export function Board({game}) {
  
  const classes = useBoardStyles();
  
  const roundPiece = (
    <div className={classes.round}>
      <img
        className={classes.img}
        src={game.settings.static.mission.round.img}
        alt={game.settings.static.mission.round.label} />
    </div>
  );
  
  const rejectsPiece = (
    <div className={classes.rejects}>
      <img
        className={classes.img}
        src={game.settings.static.mission.rejects.img}
        alt={game.settings.static.mission.rejects.label} />
    </div>
  );
  
  return (
    <div className={classes.board}>
      <img
        className={classes.img}
        src={game.settings.static.boards[game.settings.selectedBoard].img}
        alt={game.settings.static.boards[game.settings.selectedBoard].label} />
      {roundPiece}
      {rejectsPiece}
    </div>
  );
}

export default function Game({room, self}) {
  const [reveal, setReveal] = useState(false);
  
  const classes = useStyles();
  const theme = useTheme();
  
  const paddedPaper = clsx(classes.paper, classes.padding);
  
  return (
    <main className={classes.content}>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          {/* Board */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={classes.paper}>
              <Board game={room.game} />
            </Paper>
          </Grid>
          {/* Actions */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={paddedPaper}>
              <ActionToolbar
                game={room.game}
                self={self}
                power={[reveal, setReveal]} />
            </Paper>
          </Grid>
          {/* Players */}
          <Grid item xs={12}>
            <Paper className={paddedPaper}>
              <PlayersTable
                game={room.game}
                self={self}
                power={reveal} />
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