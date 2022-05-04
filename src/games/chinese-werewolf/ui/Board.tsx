import React, { useContext } from "react";
import clsx from 'clsx';
import { useEffect, useRef, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { fade } from '@material-ui/core/styles/colorManipulator';
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

const useActionBarStyles = makeStyles((theme) => ({
  panel: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: fade(theme.palette.background.default, .9)
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  shrinkRipple: {
    padding: theme.spacing(1),
  },
  headerGutters: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

function ActionBar() {
  const [client] = useContext(ClientContext);

  const classes = useActionBarStyles();

  const handleClick = () => {
      client.emit('end');
  };

  return (
    <Box>
      <Paper className={classes.panel} square elevation={0}>
        {/* header */}
        <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
          {/* TODO: Swap with brand image. */}
          <Typography variant="h6" color="inherit">
            {'狼人杀'}
          </Typography>

          <Box flexGrow={1} />

          <div>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Exit game" onClick={handleClick}>
              <ExitToApp />
            </IconButton>
          </div>
        </Toolbar>
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
  
  function PlayersTable({ G, gameMetadata }) {
    const classes = usePlayersTableStyle();

    const getPlayerName = (pid) => {
        if (gameMetadata && gameMetadata[pid].name) {
            return `${pid} ${gameMetadata[pid].name}`;
        }

        // Return default name if no name defined.
        return "Player " + pid;
    };
  
    const handleChoose = (event, playerId) => {
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
            onClick={e => handleChoose(e, player.id)}
            className={playerRowClass}>
            <TableCell className={playerCellClass} component="th" scope="row">
              {/* {G.players[player.id].name} */}
              {getPlayerName(pid)}
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
            {/* <Hidden xsDown>
              {votes}
            </Hidden>
            <Hidden smUp>
              {room.state.quests.length > 0 ?
                votes[room.state.quests.length - 1] : null}
            </Hidden> */}
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
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playersTable}
          </TableBody>
        </Table>
      </React.Fragment>
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

/**
 * Main UI component.
 * @param {object} props - Check boardgame.io documentation - https://boardgame.io/documentation/#/api/Client
 */
export function ChineseWerewolfBoard(props) {
    console.log("props", props);
    const { G, gameMetadata } = props;

    const classes = useStyles();

    const paddedPaper = clsx(classes.paper, classes.padding);

    return (
        <main className={classes.content}>
            <Container maxWidth="lg" className={classes.container}>
                <ActionBar />
                {/* Players */}
                <Grid item xs={12}>
                <Paper className={paddedPaper}>
                    <PlayersTable G={G} gameMetadata={gameMetadata} />
                </Paper>
                </Grid>
            </Container>
        </main>
    );
}
