import React, { useContext } from "react";
import clsx from 'clsx';
import { useEffect, useRef, useState } from "react";

import { fade } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from "@material-ui/core/styles";
import {
    Badge,
    Box,
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

import { ExitToApp } from "@material-ui/icons";

import { ClientContext } from '../../../Contexts';
import Log from "./Log";

class Action {
    private t: string;
    private d: any;
    private m: string;
    private updateFn: (action: Action, changes) => void;

    constructor(type?: string, data = {}, message = '', updateFn = (action: Action, changes) => {}) {
        this.t = type;
        this.d = data;
        this.m = message;
        this.updateFn = updateFn;
    }

    get type() {
        return this.t;
    }

    get data() {
        return this.d;
    }

    get message() {
        return this.m;
    }

    getType() {
        return this.type;
    }

    update(changes) {
        this.updateFn(this, changes);
    }

    clone(data: any, message: string) {
        return new Action(this.t, data, message, this.updateFn);
    }
}

const useActionBarStyles = makeStyles((theme) => ({
    panel: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: fade(theme.palette.background.default, .9)
    },
    shrinkRipple: {
      padding: theme.spacing(1),
    },
    headerGutters: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  }));
  
  function ActionBar({ G, ctx, moves, actionHandler }) {
    const [client] = useContext(ClientContext);

    const classes = useActionBarStyles();

    const [action, setAction] = actionHandler;

    const handleSwap = () => {
      if (action.type !== 'swap') {
        setAction(new Action(
            'swap',
            {},
            'Select roles to swap (? <-> ?)',
            (action, changes) => {
                if (!action.data.r1) {
                    const data = {
                        r1: changes
                    };
                    const r = changes.player?.id || changes.discard?.role;
                    const message = `Select roles to swap (${r} <-> ?)`;
                    setAction(action.clone(data, message));
                } else {
                    const data = {
                        ...action.data,
                        r2: changes
                    };

                    // do action
                    if (data.r1.player) {
                        const player = data.r1.player;
                        if (data.r2.player) {
                            // player swap
                            const p2 = data.r2.player;
                            const r2 = G.players[p2.id].roles[p2.pos];
                            const r1 = G.players[player.id].roles[player.pos];
                            moves.setRole(player.id, player.pos, r2);
                            moves.setRole(p2.id, p2.pos, r1);
                        } else {
                            // player set
                            const discard = data.r2.discard;
                            const role = G.players[player.id].roles[player.pos];
                            moves.setRole(player.id, player.pos, discard.role);
                            moves.setDiscard(discard.pos, role);
                        }
                    } else if (data.r2.player) {
                        const player = data.r2.player;
                        // player set
                        const discard = data.r1.discard;
                        const role = G.players[player.id].roles[player.pos];
                        moves.setRole(player.id, player.pos, discard.role);
                        moves.setDiscard(discard.pos, role);
                    }
                    setAction(new Action());
                }
            }
        ));
      } else {
          setAction(new Action());
      }
    };

    const handleStart = () => {
        setAction(new Action());
        moves.start();
    };

    const handleTransfer = () => {
        if (action.type !== 'transfer') {
            setAction(new Action(
                'transfer',
                {},
                'Select a player to transfer to',
                (action, changes) => {
                    const pid = changes;
                    moves.transfer(pid);
                    client.emit('bgioHostAction', 'transferHost', pid);
                    setAction(new Action());
                }
            ));
        } else {
            setAction(new Action());
        }
    };

    const handleKill = () => {
        if (action.type !== 'kill') {
            setAction(new Action(
                'kill',
                {},
                'Select a player to kill',
                (action, changes) => {
                    const pid = changes;
                    moves.kill(pid);
                    setAction(new Action());
                }
            ));
        } else {
            setAction(new Action());
        }
    };

    const handleBadge = () => {
        if (action.type !== 'badge') {
            setAction(new Action(
                'badge',
                {},
                'Select a player to badge',
                (action, changes) => {
                    const pid = changes;
                    moves.badge(pid);
                    setAction(new Action());
                }
            ));
        } else {
            setAction(new Action());
        }
    }

    const handleLove = () => {
        if (action.type !== 'love') {
            setAction(new Action(
                'love',
                {},
                'Select a player to fall in love',
                (action, changes) => {
                    const pid = changes;
                    moves.lover(pid);
                    setAction(new Action());
                }
            ));
        } else {
            setAction(new Action());
        }
    }

    const handleReveal = () => {
        moves.reveal();
    };

    const handleNext = () => {
        moves.next();
    };

    const handleEnd = () => {
        client.emit('end');
    };

    const options = (ctx.phase === 'setup') ?
        (
            <React.Fragment>
                <Tooltip
                    arrow={true}
                    title={'Swap player roles'}
                >
                    <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Swap" onClick={handleSwap}>
                        {action.type !== 'swap' ? 'Swap' : 'Cancel'}
                    </IconButton>
                </Tooltip>
            </React.Fragment>
        ) :
        (
            <React.Fragment>
                <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Kill" onClick={handleKill}>
                    {action.type !== 'kill' ? 'Kill' : 'Cancel'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Badge" onClick={handleBadge}>
                    {action.type !== 'badge' ? 'Badge' : 'Cancel'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Love" onClick={handleLove}>
                    {action.type !== 'love' ? 'Love' : 'Cancel'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Swap" onClick={handleSwap}>
                    {action.type !== 'swap' ? 'Swap' : 'Cancel'}
                </IconButton>
            </React.Fragment>
        );
  
    return (
      <Box>
        <Paper className={classes.panel} square elevation={0}>
          {/* header */}
          <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
            <Typography variant="h6" color="inherit">
              {"God Panel"}
            </Typography>

            {options}

            <Box flexGrow={1} />

            {
                G.state === 1 ?
                    <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Reveal" onClick={handleReveal}>
                        {G.reveal ? 'Unreveal' : 'Reveal'}
                    </IconButton> :
                    null
            }
            {
                ctx.phase === 'main' ?
                    <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Next" onClick={handleNext}>
                        {'Next'}
                    </IconButton> :
                    <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Start" onClick={handleStart}>
                        {'Start'}
                    </IconButton>
            }

            <Box flexGrow={1} />

            <div>
                {
                    ctx.phase === 'main' ?
                        <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Transfer" onClick={handleTransfer}>
                            {action.type !== 'transfer' ? 'Transfer' : 'Cancel'}
                        </IconButton> :
                        null
                }
                <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="End" onClick={handleEnd}>
                    <ExitToApp />
                </IconButton>
            </div>
          </Toolbar>
  
          {/* content */}
          <Box display="flex" flexDirection="column" flexGrow={1} padding={1} paddingTop={0}>
            {/* extra window */}
            
            <Box flex={1} bgcolor="wheat" marginBottom={1}>
              {action.message}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

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
  
  function PlayersTable({
      G,
      ctx,
      gameMetadata,
      moves,
      playerID,
      actionHandler,
    }) {
    const classes = usePlayersTableStyle();

    const [action] = actionHandler;

    const getPlayerName = (pid) => {
        if (gameMetadata && gameMetadata[pid].name) {
            return `${pid} ${gameMetadata[pid].name}`;
        }

        // Return default name if no name defined.
        return "Player " + pid;
    };
  
    const handleChoose = (event, playerId) => {
        if (playerID === String(G.god)) {
            switch (action.type) {
                case 'transfer':
                case 'kill':
                case 'badge':
                case 'love':
                    if (playerID !== playerId) {
                        action.update(playerId);
                    }
                    break;
            }
        } else {
            moves.vote(playerId);
        }
    };

    const handleRoleClick = (pid, idx) => {
        switch (action.type) {
            case 'swap':
                action.update({player: { id: pid, pos: idx }})
                break;
        }
    };

    let playersTable = [];
    for (const pid in G.players) {
        const player = G.players[pid];
        let playerRowClass = classes.normal;
  
        let playerCellClass: any = null;
        let imgClass = classes.img;
        // if (G.players[player.id].client.status === 'disconnected') {
        //   playerCellClass = classes.disconnected;
        //   imgClass = clsx(imgClass, classes.disconnectedImg);
        // } else if (room.state.leader === idx) {
        //   playerCellClass = classes.leader;
        // }

        const playerChosen = true;

      //   const questHistory = room.state.phase === 'voting' || room.state.phase === 'tally' ?
      //     room.state.quests.length - 1 : room.state.quests.length;
      //   const votes: any[] = [];

      //   for (let i = 0; i < questHistory; i++) {
      //     const quest = room.state.quests[i];
      //     if (quest.history.length > 0) {
      //       const history = quest.history[quest.history.length - 1];
      //       const playerVote = history.votes[player.id];
      //       votes.push(
      //         <TableCell key={player.id + '-quest' + votes.length} component="th" scope="row">
      //           <Zoom in={true}>
      //             <Card className={classes.card}>
      //               {playerVote ?
      //                 <img
      //                   className={imgClass}
      //                   src={room.ctx.settings.static.vote.approve.img}
      //                   alt={room.ctx.settings.static.vote.approve.label} /> :
      //                 <img
      //                   className={imgClass}
      //                   src={room.ctx.settings.static.vote.reject.img}
      //                   alt={room.ctx.settings.static.vote.reject.label} />}
      //             </Card>
      //           </Zoom>
      //         </TableCell>
      //       );
      //     }
      //   }

      //   if (room.state.voters.hasOwnProperty(player.id)) {
      //     const playerVoted =
      //       <TableCell key={player.id + '-quest' + votes.length} component="th" scope="row">
      //         <Zoom in={true}>
      //           <Card className={classes.card}>
      //             <img
      //               className={imgClass}
      //               src={room.ctx.settings.static.vote.cover.img}
      //               alt={room.ctx.settings.static.vote.cover.label} />
      //           </Card>
      //         </Zoom>
      //       </TableCell>;
      //     votes.push(playerVoted);
      //   }

      //   for (let i = votes.length; i < board.quests.length; i++) {
      //     votes.push(
      //       <TableCell key={player.id + '-quest' + i} component="th" scope="row">
      //         <Zoom in={false}>
      //           <Card className={classes.card}>
      //             <img
      //               className={imgClass}
      //               src={room.ctx.settings.static.vote.cover.img}
      //               alt={room.ctx.settings.static.vote.cover.label} />
      //           </Card>
      //         </Zoom>
      //       </TableCell>
      //     );
      //   }

        playersTable.push(
          <TableRow
            key={pid}
            onClick={e => handleChoose(e, pid)}
            className={playerRowClass}>
            <TableCell className={playerCellClass} component="th" scope="row">
              {getPlayerName(pid)}
            </TableCell>
            <TableCell component="th" scope="row">
              {player.roles.map((role, idx) =>
                <Zoom key={idx} in={playerChosen}>
                    <Card className={classes.card} onClick={() => {handleRoleClick(pid, idx)}}>
                    <img
                        className={imgClass}
                        src={"https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60"}
                        alt={"woohoo"} />
                    </Card>
                </Zoom>
              )}
            </TableCell>
            <TableCell component="th" scope="row">
              {player.vote}
            </TableCell>
          </TableRow>
        );
    }
  
    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              {/* At setup this will be action */}
              {/* At night this will be action */}
              {/* At day/vote this will be vote */}
              {/* At day/reveal this will be reveal */}
              <TableCell>Role</TableCell>
              <TableCell>Vote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playersTable}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }

  const useDiscardStyles = makeStyles((theme) => ({
    img: {
        overflow: 'hidden',
        display: 'block',
        width: '100%'
    },
    card: {
        marginRight: 'auto',
        maxWidth: 40
    }
  }));
  
  function Discard({ G, playerID, actionHandler }) {
    const classes = useDiscardStyles();

    const [action] = actionHandler;

    const handleRoleClick = (role, idx) => {
        switch (action.type) {
            case 'swap':
                action.update({discard: { role, pos: idx }})
                break;
        }
    };
  
    if (playerID === String(G.god)) {
        return (
            <Grid container spacing={2}>
                {G.discards.map((role, idx) => {
                    return (
                        <Grid item key={idx}>
                            <Typography>{role}</Typography>
                            <Card className={classes.card} onClick={() => {handleRoleClick(role, idx)}}>
                                <img
                                    className={classes.img}
                                    src={"https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60"}
                                    alt={"woohoo"} />
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        );
    } else {
        return null;
    }
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
    },
    panel: {
        width: '100%',
        height: '50vh'
    },
}));

/**
 * Main UI component.
 * @param {object} props - Check boardgame.io documentation - https://boardgame.io/documentation/#/api/Client
 */
export function ChineseWerewolfBoard(props) {
    const { G, ctx, gameMetadata, moves, playerID } = props;

    const actionHandler = useState(new Action());

    const classes = useStyles();

    const paddedPaper = clsx(classes.paper, classes.padding);

    return (
        <main className={classes.content}>
            <Container maxWidth="lg" className={classes.container}>
                <Grid container spacing={1}>
                    {
                        playerID === String(G.god) ?
                            <Grid item xs={12} md={12} lg={12}>
                                <ActionBar
                                    G={G}
                                    ctx={ctx}
                                    moves={moves}
                                    actionHandler={actionHandler}
                                />
                            </Grid> :
                            null
                    }
                    {/* Players */}
                    <Grid item xs={12} md={6} lg={6}>
                        <Paper className={paddedPaper}>
                            <PlayersTable
                                G={G}
                                ctx={ctx}
                                gameMetadata={gameMetadata}
                                moves={moves}
                                playerID={playerID}
                                actionHandler={actionHandler}
                            />
                            <Discard G={G} playerID={playerID} actionHandler={actionHandler}/>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Paper className={paddedPaper}>
                            <Log
                                className={classes.panel}
                                chatState={G.log}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </main>
    );
}
