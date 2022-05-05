import React, { useContext } from "react";
import clsx from 'clsx';
import { useEffect, useRef, useState } from "react";

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

import constants from "../constants.json";
import { ExitToApp } from "@material-ui/icons";

import { ClientContext } from '../../../Contexts';

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
  shrinkRipple: {
    padding: theme.spacing(1),
  },
}));

function GodActionBar({ G, ctx, moves, playerID, actionHandler }) {
  const [client] = useContext(ClientContext);

  const [action, setAction] = actionHandler;

  const classes = useActionBarStyles();

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
                        const discard = data.r2.discard;
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
                if (pid !== playerID) {
                    moves.transfer(pid);
                    client.emit('bgioHostAction', 'transferHost', pid);
                }
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
                if (pid !== playerID) {
                    moves.kill(pid);
                }
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
                if (pid !== playerID) {
                    moves.badge(pid);
                }
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
                if (pid !== playerID) {
                    moves.lover(pid);
                }
                setAction(new Action());
            }
        ));
      } else {
        setAction(new Action());
      }
  }

  const handleEnd = () => {
      client.emit('end');
  };

  if (ctx.phase === 'setup') {
    return (
        <Toolbar variant="dense">
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Swap Roles" onClick={handleSwap}>
                {action.type !== 'swap' ? 'Swap Roles' : 'Cancel'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Start Game" onClick={handleStart}>
                {'Start'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Exit Game" onClick={handleEnd}>
                <ExitToApp />
            </IconButton>
        </Toolbar>
      );
  } else {
    return (
        <Toolbar variant="dense">
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Kill Player" onClick={handleKill}>
                {action.type !== 'kill' ? 'Kill' : 'Cancel'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Badge Player" onClick={handleBadge}>
                {action.type !== 'badge' ? 'Badge' : 'Cancel'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Love" onClick={handleLove}>
                {action.type !== 'lover' ? 'Love' : 'Cancel'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Transfer Host" onClick={handleTransfer}>
                {action.type !== 'transfer' ? 'Transfer Host' : 'Cancel'}
            </IconButton>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="End game" onClick={handleEnd}>
                <ExitToApp />
            </IconButton>
        </Toolbar>
      );    
  }
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
                    action.update(playerId)
                    break;
            }
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
              <Zoom in={playerChosen}>
                <Card className={classes.card}>
                  <img
                    className={imgClass}
                    src={"https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F13%2F2015%2F04%2F05%2Ffeatured.jpg&q=60"}
                    alt={"woohoo"} />
                </Card>
              </Zoom>
            </TableCell>
            <TableCell>
                {
                    pid === playerID && playerID === String(G.god) ?
                        <GodActionBar
                            G={G}
                            ctx={ctx}
                            moves={moves}
                            playerID={playerID}
                            actionHandler={actionHandler}
                        />
                    : null
                }
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
              <TableCell>{action.message}</TableCell>
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
  
    if (playerID === String(G.god)) {
        return (
            <Grid container spacing={2}>
                {G.discards.map((card, idx) => {
                    return (
                        <Grid item key={idx}>
                            <Typography>{card}</Typography>
                            <Card className={classes.card}>
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
    }
}));

/**
 * Main UI component.
 * @param {object} props - Check boardgame.io documentation - https://boardgame.io/documentation/#/api/Client
 */
export function ChineseWerewolfBoard(props) {
    console.log("props", props);
    const { G, ctx, gameMetadata, moves, playerID } = props;

    const actionHandler = useState(new Action());

    const classes = useStyles();

    const paddedPaper = clsx(classes.paper, classes.padding);

    return (
        <main className={classes.content}>
            <Container maxWidth="lg" className={classes.container}>
                {/* Players */}
                <Grid item xs={12}>
                    <Paper className={paddedPaper}>
                        <PlayersTable
                            G={G}
                            ctx={ctx}
                            gameMetadata={gameMetadata}
                            moves={moves}
                            playerID={playerID}
                            actionHandler={actionHandler}
                        />
                    </Paper>
                    <Discard G={G} playerID={playerID} actionHandler={actionHandler}/>
                </Grid>
            </Container>
        </main>
    );
}
