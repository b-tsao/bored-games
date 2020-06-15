import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Toolbar, Typography, IconButton, Paper, Box } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
import Chat from './Chat';

const useStyles = makeStyles((theme) => ({
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

type SidePanel = {
  className: string,
  game: string,
  chatState: Array<Object>
}

function SidePanel({ className, game, chatState }: SidePanel) {
  const classes = useStyles();

  return (
    <Box className={className}>
      <Paper className={classes.panel} square elevation={0}>
        {/* header */}
        <Toolbar classes={{ gutters: classes.headerGutters }} variant="dense">
          {/* TODO: Swap with brand image. */}
          <Typography variant="h6" color="inherit">
            {(() => {
              switch (game) {
                case 'mahjong':
                  return '𝗠𝗔𝗛𝗝𝗢𝗡𝗚'
                default:
                  return game
              }
            })()}
          </Typography>

          <Box flexGrow={1} />

          <div>
            <IconButton classes={{ root: classes.shrinkRipple }} edge="end" color="inherit" aria-label="Exit game">
              <ExitToApp />
            </IconButton>
          </div>
        </Toolbar>

        {/* content */}
        <Box display="flex" flexDirection="column" flexGrow={1} padding={1} paddingTop={0}>
          {/* extra window */}
          {/*
          <Box flex={1} bgcolor="wheat" marginBottom={1}>
            extra window
          </Box>
          */}

          {/* chat */}
          <Chat chatState={chatState} />
        </Box>
      </Paper>
    </Box>
  );
}

export default SidePanel;
