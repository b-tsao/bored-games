import React, { useContext } from "react";
import clsx from 'clsx';
import { useState } from "react";

import { fade } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from "@material-ui/core/styles";
import {
    Box,
    Card,
    Container,
    Grid,
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

import { Favorite } from "@material-ui/icons";

import { ClientContext } from '../../../Contexts';
import { roleToImg, roleToString } from '../game/player';
import Log from "./Log";
import Cards from "../game/cards";

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
      background: fade(theme.palette.background.default, .7)
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
            '请点选互换的角色 (? <-> ?)',
            (action, changes) => {
                if (!action.data.r1) {
                    const data = {
                        r1: changes
                    };
                    const r = changes.player ? G.players[changes.player.id].roles[changes.player.pos] : changes.discard?.role;
                    const message = `请选择要互换的角色 (${roleToString(r)} <-> ?)`;
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
                '请点选上帝转移的对象',
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
                '请点选死亡的玩家',
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
                '请点选获得警徽的玩家',
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
                '请点选恋爱的玩家',
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
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Swap" onClick={handleSwap}>
                    {action.type !== 'swap' ? '互换' : '取消'}
                </IconButton>
            </React.Fragment>
        ) :
        (
            <React.Fragment>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Kill" onClick={handleKill}>
                    {action.type !== 'kill' ? '死亡' : '取消'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Badge" onClick={handleBadge}>
                    {action.type !== 'badge' ? '警徽' : '取消'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Love" onClick={handleLove}>
                    {action.type !== 'love' ? '恋爱' : '取消'}
                </IconButton>
                <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Swap" onClick={handleSwap}>
                    {action.type !== 'swap' ? '互换' : '取消'}
                </IconButton>
            </React.Fragment>
        );
  
    return (
      <Box>
        <Paper className={classes.panel} elevation={0}>
          {/* header */}
          <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="h4" color="inherit">
                        上帝操作
                    </Typography>
                </Grid>
                <Grid item>
                    {options}
                </Grid>
                <Box flexGrow={1} />
                <Grid item>
                    {
                        G.state === 1 ?
                            <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Reveal" onClick={handleReveal}>
                                {G.reveal ? '隐票' : (G.election && G.election.length === 0 ? '上警' : '统票')}
                            </IconButton> :
                            null
                    }
                    {
                        ctx.phase === 'main' ?
                            <IconButton classes={{ root: classes.shrinkRipple }} color="primary" aria-label="Next" onClick={handleNext}>
                                {G.state === 0 ? '进入白天' : '进入夜晚'}
                            </IconButton> :
                            <IconButton classes={{ root: classes.shrinkRipple }} color="primary" aria-label="Start" onClick={handleStart}>
                                {'开始'}
                            </IconButton>
                    }
                </Grid>
                <Box flexGrow={1} />
                <Grid item>
                    {
                        ctx.phase === 'main' ?
                            <IconButton classes={{ root: classes.shrinkRipple }} color="inherit" aria-label="Transfer" onClick={handleTransfer}>
                                {action.type !== 'transfer' ? '移交上帝' : '取消'}
                            </IconButton> :
                            null
                    }
                    <IconButton classes={{ root: classes.shrinkRipple }} color="secondary" aria-label="End" onClick={handleEnd}>
                        {'结束游戏'}
                    </IconButton>
                </Grid>
            </Grid>
          </Toolbar>
  
          {/* content */}
          <Box display="flex" flexDirection="column" flexGrow={1} padding={1} paddingTop={0}>
            {/* extra window */}
            <Box>
              <Typography>{action.message}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

const usePlayersTableStyle = makeStyles(theme => ({
    dead: {
      color: 'rgba(0, 0, 0, 0.33)'
    },
    leader: {
      color: 'rgba(255,215,0)'
    },
    card: {
      marginRight: 'auto',
      maxWidth: 40
    },
    deadImg: {
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
    },
    roles: {
        display: 'flex'
    }
  }));
  
  function PlayersTable({
      G,
      ctx,
      gameMetadata,
      moves,
      playerID,
      actionHandler,
      setRoleDisplay
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

    const handleHover = (role?) => {
        if (role !== undefined) {
            setRoleDisplay([role]);
        } else {
            setRoleDisplay(playerID ? G.players[playerID].roles : []);
        }
    };

    let playersTable = [];
    for (const pid in G.players) {
        const player = G.players[pid];
        let playerRowClass = classes.normal;
  
        let playerCellClass: any = null;
        let imgClass = classes.img;
        if (pid === String(G.god)) {
          playerCellClass = classes.leader;
        } else if (!player.alive) {
          playerCellClass = classes.dead;
          imgClass = clsx(imgClass, classes.deadImg);
        }

        let voteClass: any = null;
        if (!G.reveal) {
            voteClass = classes.dead;
        }

        playersTable.push(
          <TableRow
            key={pid}
            onClick={e => handleChoose(e, pid)}
            className={playerRowClass}>
            <TableCell className={playerCellClass} component="th" scope="row">
              {getPlayerName(pid)}
              <Zoom in={player.lover}>
                  <Favorite />
              </Zoom>
            </TableCell>
            <TableCell component="th" scope="row">
              <div className={classes.roles}>
                {player.roles.map((role, idx) =>
                    <Card
                        key={idx}
                        className={classes.card}
                        onClick={() => {handleRoleClick(pid, idx)}}
                        onMouseOver={() => { handleHover(role) }}
                        onMouseLeave={() => { handleHover() }}
                    >
                        <img
                            className={imgClass}
                            src={roleToImg(role)}
                            alt={role} />
                    </Card>
                )}
                <Zoom in={G.badge === pid || (G.election && G.election.filter((player) => pid === player.id && !player.drop).length > 0)}>
                    <Tooltip
                        arrow={true}
                        placement="top"
                        title={Cards.sheriff.label}
                    >
                        <Card className={classes.card}>
                            <img
                                className={imgClass}
                                src={Cards.sheriff.img}
                                alt={Cards.sheriff.label} />
                        </Card>
                    </Tooltip>
                </Zoom>
              </div>
            </TableCell>
            <TableCell className={voteClass} component="th" scope="row">
              <Typography>{player.vote}</Typography>
            </TableCell>
          </TableRow>
        );
    }
  
    return (
        <Table>
            <TableHead>
            <TableRow>
                <TableCell><Typography>玩家</Typography></TableCell>
                <TableCell><Typography>角色</Typography></TableCell>
                <TableCell><Typography>投票</Typography></TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {playersTable}
            </TableBody>
        </Table>
    );
  }

  const usePlayerCardStyles = makeStyles((theme) => ({
    playerCard: {
        display: 'flex'
    },
    card: {
        display: 'flex',
        maxWidth: 127.66,
        maxHeight: 198.77,
        margin: 'auto',
        perspective: '1000px',
        boxShadow: 'none'
    },
    img: {
        overflow: 'hidden',
        display: 'block',
        width: '100%',
        height: '100%'
    }
  }));
  
  function PlayerCard({ roles }) {
    const classes = usePlayerCardStyles();

    return (
        <div className={classes.playerCard}>
            {roles.map((role, idx) => (
                <Card key={idx} className={classes.card}>
                    <img
                        className={classes.img}
                        src={roleToImg(role)}
                        alt={role}
                    />
                </Card>
            ))}
        </div>
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
  
  function Discard({
      G,
      playerID,
      actionHandler,
      setRoleDisplay
    }) {
    const classes = useDiscardStyles();

    const [action] = actionHandler;

    const handleRoleClick = (role, idx) => {
        switch (action.type) {
            case 'swap':
                action.update({discard: { role, pos: idx }})
                break;
        }
    };

    const handleHover = (role?) => {
        if (role !== undefined) {
            setRoleDisplay([role]);
        } else {
            setRoleDisplay(playerID ? G.players[playerID].roles : []);
        }
    };

    return (
        <Grid container spacing={2}>
            {G.discards.map((role, idx) => {
                return (
                    <Grid item key={idx}>
                        <Card
                            className={classes.card}
                            onClick={() => { handleRoleClick(role, idx) }}
                            onMouseOver={() => { handleHover(role) }}
                            onMouseLeave={() => { handleHover() }}
                        >
                            <img
                                className={classes.img}
                                src={roleToImg(role)}
                                alt={roleToString(role)} />
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
  }

const useStyles = makeStyles(theme => ({
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    setup: {
        backgroundImage: 'url(https://5b0988e595225.cdn.sohucs.com/images/20180223/33b30445ff2f4217b4b85e7833f8b898.jpeg)',
    },
    day: {
        backgroundImage: 'url(https://5b0988e595225.cdn.sohucs.com/images/20180223/cc60468d651c4f82af7aeeb99ff83ef4.jpeg)',
    },
    night: {
        backgroundImage: 'url(https://5b0988e595225.cdn.sohucs.com/images/20180223/4a8dfbe3594848f89e240d0e2fdffd5f.jpeg)',
    },
    container: {
      height: '100vh',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),

      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    },
    paper: {
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      background: fade(theme.palette.background.default, .7)
    },
    padding: {
      padding: theme.spacing(2)
    },
    panel: {
        width: '100%',
        height: '50vh',
    },
}));

/**
 * Main UI component.
 * @param {object} props - Check boardgame.io documentation - https://boardgame.io/documentation/#/api/Client
 */
export function ChineseWerewolfBoard(props) {
    const { G, ctx, gameMetadata, moves, playerID } = props;

    const actionHandler = useState(new Action());
    const [roleDisplay, setRoleDisplay] = useState([]);

    const classes = useStyles();

    const paddedPaper = clsx(classes.paper, classes.padding);

    const container = ctx.phase === 'main' ? G.state === 0 ? clsx(classes.container, classes.night) : clsx(classes.container, classes.day) : clsx(classes.container, classes.setup);

    // const rolesDisplay = roleDisplay.length > 0 ? roleDisplay : playerID ? G.players[playerID].roles : [];
    const rolesDisplay = playerID ? G.players[playerID].roles : [];

    return (
        <main className={classes.content}>
            <Container maxWidth="lg" className={container}>
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
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <PlayersTable
                                        G={G}
                                        ctx={ctx}
                                        gameMetadata={gameMetadata}
                                        moves={moves}
                                        playerID={playerID}
                                        actionHandler={actionHandler}
                                        setRoleDisplay={setRoleDisplay}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Discard
                                        G={G}
                                        playerID={playerID}
                                        actionHandler={actionHandler}
                                        setRoleDisplay={setRoleDisplay}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Grid container spacing={1}>
                            {
                                rolesDisplay.length > 0 ?
                                    <Grid item xs={12}>
                                        <Paper className={paddedPaper}>
                                            <PlayerCard roles={rolesDisplay} />
                                        </Paper>
                                    </Grid> :
                                    null
                            }
                            <Grid item xs={12}>
                                <Log
                                    className={classes.panel}
                                    chatState={G.log}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </main>
    );
}
