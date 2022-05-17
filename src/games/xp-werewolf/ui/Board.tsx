import React, { useContext } from "react";
import clsx from 'clsx';
import { useState } from "react";

import { alpha } from '@material-ui/core/styles';
import { makeStyles } from "@material-ui/core/styles";
import {
    Avatar,
    Box,
    Button,
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

import { CheckCircleOutline } from "@material-ui/icons";

import { ClientContext } from '../../../Contexts';
import Chat from "./Chat";

const useActionBarStyles = makeStyles((theme) => ({
    panel: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: alpha(theme.palette.background.default, .7)
    },
    shrinkRipple: {
      padding: theme.spacing(1),
    },
    headerGutters: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  }));
  
  function ActionBar({ G, ctx }) {
    const [client] = useContext(ClientContext);

    const classes = useActionBarStyles();

    const handleEnd = () => {
        client.emit('end');
    };

    return (
      <Box>
        <Paper className={classes.panel} elevation={0}>
          <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
            <Box flexGrow={1} />
            <IconButton classes={{ root: classes.shrinkRipple }} color="secondary" aria-label="End" onClick={handleEnd}>
                结束游戏
            </IconButton>
          </Toolbar>
        </Paper>
      </Box>
    );
  }

const usePlayersTableStyle = makeStyles(theme => ({
    tableScroll: {
      height: '75vh',
      overflowY: 'auto'
    },
    dead: {
      color: 'rgba(0, 0, 0, 0.33)'
    },
    leader: {
      color: 'rgba(255,215,0)'
    },
    card: {
      marginRight: 'auto',
      maxWidth: 40,
      maxHeight: 56.78
    },
    avatar: {
        maxWidth: 90,
        width: '100%',
        height: '100%'
    },
    deadImg: {
      opacity: 0.5,
      filter: 'alpha(opacity=50)', /* For IE8 and earlier */
    },
    img: {
      overflow: 'hidden',
      display: 'block',
      width: '100%',
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
        display: 'flex',
        alignItems: 'center'
    }
  }));
  
  function PlayersTable({
      G,
      ctx,
      gameMetadata,
      moves,
      playerID,
      setSecretDisplay
    }) {
    const classes = usePlayersTableStyle();

    const getPlayerName = (pid) => {
        if (gameMetadata && gameMetadata[pid].name) {
            return `${pid} ${gameMetadata[pid].name}`;
        }

        // Return default name if no name defined.
        return "Player " + pid;
    };

    const handleHover = (secret?) => {
        if (secret !== undefined) {
            setSecretDisplay(secret);
        } else {
            setSecretDisplay('');
        }
    };
  
    const handleChoose = (event, playerId) => {
        if (ctx.phase === 'day') {
            moves.vote(playerId);
        } else if (ctx.phase === 'night') {
            moves.reveal(playerId);
        }
    };

    let playersTable = [];
    for (const pid in G.players) {
        const player = G.players[pid];
        let playerRowClass = classes.normal;
  
        let playerCellClass: any = null;
        let imgClass = classes.img;
        let avatarClass = classes.avatar;
        let voteClass: any = undefined;
        if (pid === String(G.wolf)) {
          playerCellClass = classes.leader;
        } else if (!player.alive) {
          playerCellClass = classes.dead;
          imgClass = clsx(imgClass, classes.deadImg);
          avatarClass = clsx(avatarClass, classes.deadImg);
          voteClass = classes.dead;
        }

        let voteColor: any = undefined;
        if (playerID && G.players[playerID].vote === pid) {
            voteColor = 'primary';
        }

        let voteComponent: any = null;
        if (playerID && G.players[pid].alive) {
            if (ctx.phase === 'day' && (!G.pk || G.pk.indexOf(pid) >= 0)) {
                voteComponent = (
                    <Button
                        variant='contained'
                        color={voteColor}
                    >
                        投票
                    </Button>
                );
            } else if (ctx.phase === 'night' && playerID === String(G.wolf)) {
                voteComponent = (
                    <Button
                        variant='contained'
                        color={voteColor}
                    >
                        刀
                    </Button>
                );
            }
        } else {
            voteComponent = <Typography>{player.vote}</Typography>;
        }

        let readyComponent = ctx.phase === 'setup' ? (
                <Zoom in={player.secret !== ''}>
                    <CheckCircleOutline />
                </Zoom>
            ) : (
                <Zoom in={player.vote !== ''}>
                    <CheckCircleOutline />
                </Zoom>
            );

        playersTable.push(
          <TableRow
            key={pid}
            onClick={e => handleChoose(e, pid)}
            onMouseOver={() => { handleHover(player.secret) }}
            onMouseLeave={() => { handleHover() }}
            className={playerRowClass}>
            <TableCell className={playerCellClass} component="th" scope="row">
              {getPlayerName(pid)}
            </TableCell>
            <TableCell className={voteClass} component="th" scope="row">
              {voteComponent}
            </TableCell>
            <TableCell className={playerCellClass} component="th" scope="row">
              {readyComponent}
            </TableCell>
          </TableRow>
        );
    }
  
    return (
        <Box className={classes.tableScroll}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><Typography>玩家</Typography></TableCell>
                        <TableCell><Typography>投票</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {playersTable}
                </TableBody>
            </Table>
        </Box>
    );
  }

  const usePlayerSecretStyles = makeStyles((theme) => ({
    playerCard: {
        display: 'flex'
    }
  }));
  
  function PlayerSecret({ secret }) {
    const classes = usePlayerSecretStyles();

    return (
        <div className={classes.playerCard}>
            XP: {secret}
        </div>
    );
  }

const useStyles = makeStyles(theme => ({
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',

      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
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
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    paper: {
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      background: alpha(theme.palette.background.default, .7)
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
export function XPWerewolfBoard(props) {
    const { G, ctx, gameMetadata, moves, playerID } = props;

    const [secretDisplay, setSecretDisplay] = useState('');

    const classes = useStyles();

    const paddedPaper = clsx(classes.paper, classes.padding);

    const content = ctx.phase === 'day'? clsx(classes.content, classes.day) : ctx.phase === 'night' ? clsx(classes.content, classes.night) : clsx(classes.content, classes.setup);

    const secret = secretDisplay !== '' ? secretDisplay : playerID ? G.players[playerID].secret : '';

    return (
        <main className={content}>
            <Container maxWidth="lg" className={classes.container}>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={12} lg={12}>
                        <ActionBar
                            G={G}
                            ctx={ctx}
                        />  
                    </Grid>
                    {/* Players */}
                    <Grid item xs={12} md={6} lg={6}>
                        <Paper className={paddedPaper}>
                            <PlayersTable
                                G={G}
                                ctx={ctx}
                                gameMetadata={gameMetadata}
                                moves={moves}
                                playerID={playerID}
                                setSecretDisplay={setSecretDisplay}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                        <Grid container spacing={1}>
                            {
                                secret !== '' ?
                                    <Grid item xs={12}>
                                        <Paper className={paddedPaper}>
                                            <PlayerSecret secret={secret} />
                                        </Paper>
                                    </Grid> :
                                    null
                            }
                            <Grid item xs={12}>
                                <Chat
                                    className={classes.panel}
                                    G={G}
                                    ctx={ctx}
                                    moves={moves}
                                    playerID={playerID}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </main>
    );
}
