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
  Card,
  CardActionArea,
  CardContent,
  Container,
  Fade,
  Grid,
  Hidden,
  IconButton,
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

import {ClientContext, MainDisplayContext} from '../../../Contexts';

const useToolbarStyles = makeStyles(theme => ({
  toolbar: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  spacer: {
    flex: '1 1 100%',
  },
  margin: {
    margin: theme.spacing(1)
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
    boxShadow: 'none'
  },
  voteCard: {
    display: 'flex',
    maxWidth: 82.75,
    maxHeight: 105.25,
    margin: 'auto'
  },
  questCard: {
    display: 'flex',
    maxWidth: 82.75,
    maxHeight: 134.66,
    margin: 'auto'
  },
  cardActionArea: {
    position: 'relative',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    transition: 'transform 600ms',
    transformStyle: 'preserve-3d',
    boxShadow:'0 4px 8px 0 rgba(0,0,0,0.2)'
  },
  reveal: {
    transform: 'rotateY(180deg)'
  },
  front: {
    zIndex: 1,
    backgroundColor: '#bbb',
    color: 'black',
    '&, $back': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      transform: 'rotateY(0deg)'
    }
  },
  back: {
    backgroundColor: '#bbb',
    color: 'white',
    transform: 'rotateY(180deg)'
  },
  img: {
    overflow: 'hidden',
    display: 'block',
    width: '100%',
    height: '100%'
  },
  disabledImg: {
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
  }
}));

const ActionToolbar = ({room, self, power}) => {
  const [client, setClient] = useContext(ClientContext);
  const [mainDisplay, setMainDisplay] = useContext(MainDisplayContext);
  
  const [reveal, setReveal] = power;
  
  const classes = useToolbarStyles();
  
  const handlePropose = () => {
    client.emit('game', 'propose');
  };
  
  const handleLeave = () => {
    if (room.state.phase === 'end') {
      client.emit('game', 'disconnect');
      setMainDisplay('gameroom');
    } else {
      client.disconnect();
      setClient(null);
      setMainDisplay('home');
    }
  };
  
  const handleSelect = () => {
    setReveal(!reveal);
  };
  
  const handleVote = (vote) => {
    client.emit('game', 'vote', {vote});
  };
  
  const handleQuest = (decision) => {
    client.emit('game', 'quest', {decision});
  };

  const isLeader = self && self.id === room.state.players[room.state.leader].id;
  const choosePhase = room.state.phase === 'choosing';
  const selectedBoard = room.ctx.settings.selectedBoard;
  const board = room.ctx.settings.static.boards[selectedBoard];
  const currentQuest = board.quests[room.state.quests.length - 1];
  const enableVote = isLeader && choosePhase && Object.keys(room.state.team) === currentQuest.team;
  
  const disableVote = room.state.phase !== 'voting';
  const disableQuest = room.state.phase !== 'questing' || 
                       !self || 
                       !room.state.team.hasOwnProperty(self.id);
  
  const cardActionAreaClass = reveal ? clsx(classes.cardActionArea, classes.reveal) : classes.cardActionArea;

  let player;
  for (const p of room.state.players) {
    if (p.id === self.id) {
      player = p;
    }
  }
  const playerCard = player && player.card ? (
    <Card className={classes.card}>
      <div
        className={cardActionAreaClass}
        style={{cursor: 'pointer'}}
        onClick={handleSelect}>
        <div className={classes.front}>
          <img
            className={classes.img}
            src={room.ctx.settings.static.cards.cover.img}
            alt={room.ctx.settings.static.cards.cover.label} />
        </div>
        <div className={classes.back}>
          <img
            className={classes.img}
            src={room.ctx.settings.static.cards[player.card.side][player.card.idx].img}
            alt={room.ctx.settings.static.cards[player.card.side][player.card.idx].label} />
        </div>
      </div>
    </Card>
  ) : null;
  
  const voteClass = disableVote ? clsx(classes.img, classes.disabledImg) : classes.img;
  const questClass = disableQuest ? clsx(classes.img, classes.disabledImg) : classes.img;
  
  const approveVote = player && player.card ? (
    <Card className={classes.voteCard}>
      <CardActionArea
        disabled={disableVote}
        className={classes.cardActionArea}
        onClick={() => {handleVote(true)}}>
        <img
          className={voteClass}
          src={room.ctx.settings.static.vote.approve.img}
          alt={room.ctx.settings.static.vote.approve.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const rejectVote = player && player.card ? (
    <Card className={classes.voteCard}>
      <CardActionArea
        disabled={disableVote}
        className={classes.cardActionArea}
        onClick={() => {handleVote(false)}}>
        <img
          className={voteClass}
          src={room.ctx.settings.static.vote.reject.img}
          alt={room.ctx.settings.static.vote.reject.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const successCard = player && player.card ? (
    <Card className={classes.questCard}>
      <CardActionArea
        disabled={disableQuest}
        className={classes.cardActionArea}
        onClick={() => {handleQuest(true)}}>
        <img
          className={questClass}
          src={room.ctx.settings.static.quest.success.img}
          alt={room.ctx.settings.static.quest.success.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const failCard = player && player.card ? (
    <Card className={classes.questCard}>
      <CardActionArea
        disabled={disableQuest}
        className={classes.cardActionArea}
        onClick={() => {handleQuest(false)}}>
        <img
          className={questClass}
          src={room.ctx.settings.static.quest.fail.img}
          alt={room.ctx.settings.static.quest.fail.label} />
      </CardActionArea>
    </Card>
  ) : null;
  
  const voteIcon = player ? (
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
            {room.state.message}
          </Typography>
        </div>
        <div className={classes.spacer} />
        <div className={classes.actions}>
          {voteIcon}
          <Tooltip title="Leave Game" placement="top">
            <div>
              <Link to="/" onClick={handleLeave} className={classes.linkButton}>
                <IconButton aria-label="Connect">
                  <LeaveIcon />
                </IconButton>
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
              <Grid item xs={6} md={6} lg={6}>
                {successCard}
              </Grid>
              <Grid item xs={6} md={6} lg={6}>
                {failCard}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

const usePlayersTableStyle = makeStyles(theme => ({
  disconnected: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  leader: {
    color: 'rgba(255,215,0)'
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

function PlayersTable({room, self, power}) {
  const [client] = useContext(ClientContext);
  
  const classes = usePlayersTableStyle();

  const isLeader = self && self.id === room.state.players[room.state.leader].id;
  const choosePhase = room.state.phase === 'choosing';
  const canPropose = isLeader && choosePhase;
  
  const handleChoose = (event, playerId) => {
    if (canPropose) {
      client.emit('game', 'choose', {id: playerId});
    }
  };
  
  const selectedBoard = room.ctx.settings.selectedBoard;
  const board = room.ctx.settings.static.boards[selectedBoard];
  
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
            <Hidden smUp>
              <TableCell>Vote</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {room.state.players.map((player, idx) => {
            let playerRowClass = classes.normal;
            if (power) {
              if (player.card && player.card.side === 'evil') {
                playerRowClass = classes.evil;
              } else if (player.card && player.card.id === 'merlin') {
                playerRowClass = classes.merlin;
              }
            }
            
            let playerCellClass = null;
            let imgClass = classes.img;
            if (room.ctx.players[player.id].client.status === 'disconnected') {
              playerCellClass = classes.disconnected;
              imgClass = clsx(imgClass, classes.disconnectedImg);
            } else if (room.state.leader === idx) {
              playerCellClass = classes.leader;
            }
            
            const playerChosen = room.state.team.hasOwnProperty(player.id);
            
            const questHistory = room.state.phase === 'voting' || room.state.phase === 'tally' ?
              room.state.quests.length - 1 : room.state.quests.length;
            const votes = [];
            
            for (let i = 0; i < questHistory; i++) {
              const quest = room.state.quests[i];
              if (quest.history.length > 0) {
                const history = quest.history[quest.history.length - 1];
                const playerVote = history.votes[player.id];
                votes.push(
                  <TableCell key={player.id + '-quest' + votes.length} component="th" scope="row">
                    <Zoom in={true}>
                      <Card className={classes.card}>
                        {playerVote ?
                          <img
                            className={imgClass}
                            src={room.ctx.settings.static.vote.approve.img}
                            alt={room.ctx.settings.static.vote.approve.label} /> :
                          <img
                            className={imgClass}
                            src={room.ctx.settings.static.vote.reject.img}
                            alt={room.ctx.settings.static.vote.reject.label} />}
                      </Card>
                    </Zoom>
                  </TableCell>
                );
              }
            }
            
            if (room.state.voters.hasOwnProperty(player.id)) {
              const playerVoted = 
                <TableCell key={player.id + '-quest' + votes.length} component="th" scope="row">
                  <Zoom in={true}>
                    <Card className={classes.card}>
                      <img
                        className={imgClass}
                        src={room.ctx.settings.static.vote.cover.img}
                        alt={room.ctx.settings.static.vote.cover.label} />
                    </Card>
                  </Zoom>
                </TableCell>;
              votes.push(playerVoted);
            }
            
            for (let i = votes.length; i < board.quests.length; i++) {
              votes.push(
                <TableCell key={player.id + '-quest' + i} component="th" scope="row">
                  <Zoom in={false}>
                    <Card className={classes.card}>
                      <img
                        className={imgClass}
                        src={room.ctx.settings.static.vote.cover.img}
                        alt={room.ctx.settings.static.vote.cover.label} />
                    </Card>
                  </Zoom>
                </TableCell>
              );
            }
            
            return (
              <TableRow
                key={idx}
                onClick={e => handleChoose(e, player.id)}
                className={playerRowClass}>
                <TableCell className={playerCellClass} component="th" scope="row">
                  {room.ctx.players[player.id].name}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Zoom in={playerChosen}>
                    <Card className={classes.card}>
                      <img
                        className={imgClass}
                        src={room.ctx.settings.static.quest.chosen.img}
                        alt={room.ctx.settings.static.quest.chosen.label} />
                    </Card>
                  </Zoom>
                </TableCell>
                <Hidden xsDown>
                  {votes}
                </Hidden>
                <Hidden smUp>
                  {room.state.quests.length > 0 ?
                    votes[room.state.quests.length - 1] : null}
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
  quest: {
    position: 'absolute',
    width: '17.5%'
  },
  round: {
    position: 'absolute',
    width: '8%',
    transition: 'left 1s linear'
  },
  rejects: {
    position: 'absolute',
    width: '11.8%',
    transition: 'left 1s linear'
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
  playerCard: {
    height: '14%',
    width: '10%'
  },
  playerMedia: {
    height: '100%',
    width: '100%'
  }
}));

export function Board({room, self, power}) {
  
  const classes = useBoardStyles();
  
  const players = room.state.players.map((player, idx) => {
    return (
      <Card key={idx} className={classes.playerCard}>
        <CardActionArea>
          <img
            className={classes.playerMedia}
            src={room.ctx.settings.static.quest.chosen.img}
            alt={room.ctx.settings.static.quest.chosen.label}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {room.ctx.players[player.id].name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  });
  
  const currentQuest = room.state.quests.length - 1;
  let rejectedTeams = room.state.quests[currentQuest].history.length - 1;
  if (room.ctx.phase === 'choosing' || room.ctx.phase === 'voting') {
    rejectedTeams++;
  }
  
  const roundStyle = {
    top: '56.7%',
    left: 14.5 + 18.75 * currentQuest + '%'
  };
  
  const rejectsStyle = {
    top: '78%',
    left: 5.1 + 13.75 * rejectedTeams + '%'
  };
  
  const roundPiece = (
    <div style={roundStyle} className={classes.round}>
      <img
        className={classes.img}
        src={room.ctx.settings.static.quest.round.img}
        alt={room.ctx.settings.static.quest.round.label} />
    </div>
  );
  
  const rejectsPiece = (
    <div style={rejectsStyle} className={classes.rejects}>
      <img
        className={classes.img}
        src={room.ctx.settings.static.quest.rejects.img}
        alt={room.ctx.settings.static.quest.rejects.label} />
    </div>
  );
  
  const questResults = [];
  for (let i = 0; i < room.state.quests.length; i++) {
    if (room.state.quests[i].outcome) {
      const questPieces = room.ctx.settings.static.quest;
      const result = room.state.quests[i].outcome.success ? questPieces.succeed : questPieces.failed;
      questResults.push(
        <Fade key={'quest-result' + i} in={true}>
          <div style={{top: '40%', left: 2.5 + 18.9 * i + '%'}} className={classes.quest}>
            <img
              className={classes.img}
              src={result.img}
              alt={result.label} />
          </div>
        </Fade>
      );
    }
  }
  
  return (
    <div className={classes.board}>
      <img
        className={classes.img}
        src={room.ctx.settings.static.boards[room.ctx.settings.selectedBoard].img}
        alt={room.ctx.settings.static.boards[room.ctx.settings.selectedBoard].label} />
      {questResults}
      {roundPiece}
      {rejectsPiece}
      {players}
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    height: '100vh',
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
              <Board room={room}
                self={self}
                power={reveal} />
            </Paper>
          </Grid>
          {/* Actions */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper className={paddedPaper}>
              <ActionToolbar
                room={room}
                self={self}
                power={[reveal, setReveal]} />
            </Paper>
          </Grid>
          {/* Players */}
          {/*<Grid item xs={12}>
            <Paper className={paddedPaper}>
              <PlayersTable
                room={room}
                self={self}
                power={reveal} />
            </Paper>
          </Grid>*/}
        </Grid>
      </Container>
    </main>
  );
}

Game.propTypes = {
  room: PropTypes.object.isRequired
}