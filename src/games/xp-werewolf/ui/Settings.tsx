import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import {
  makeStyles,
} from '@material-ui/core/styles';

import {
  Avatar,
  Card,
  CardActionArea,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';

import { ClientContext } from '../../../Contexts';

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

function ExtraSettings({ self, settings }) {
  const [client] = useContext(ClientContext);

  const classes = useExtraSettingsStyles();

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
        </FormControl>
      </div>
    </React.Fragment>
  );
}

const usePlayerSettingsStyle = makeStyles(theme => ({
  playerSettings: {
    display: 'flex',
  }
}));

function PlayerSettings({ self, players, settings }) {
  const [client] = useContext(ClientContext);

  const [error, setError] = useState(null);

  const classes = usePlayerSettingsStyle();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let numPlayers = Number(event.target.value);
      if (Object.keys(players).length > numPlayers) {
        numPlayers = Object.keys(players).length;
        setError("无法设置为低于当前加入的玩家数量");
      } else if (numPlayers > 20) {
        numPlayers = 20;
        setError("玩家限制的最大数量");
      }
      client.emit('settings', { numPlayers });
  };

  const handleBlur = () => {
    setError(null);
  }

  const disabled = !self || !self.host;

  return (
    <React.Fragment>
      <div className={classes.playerSettings}>
        <TextField
          error={!!error}
          id="outlined-number"
          label="玩家"
          type="number"
          helperText={error}
          value={settings.numPlayers}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      </div>
    </React.Fragment>
  );
}

const useStyles = makeStyles(theme => ({
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
    padding: theme.spacing(2)
  },
}));

export function XPWerewolfSettings({ room, self }) {
  const classes = useStyles();

  const paddedPaper = clsx(classes.paper, classes.padding);

  return (
    <Grid container spacing={3}>
        {/* Extra Settings */}
        <Grid item xs={12} md={6} lg={6}>
            <Paper className={paddedPaper}>
                <ExtraSettings self={self} settings={room.ctx.settings} />
                <PlayerSettings self={self} players={room.ctx.players} settings={room.ctx.settings} />
            </Paper>
        </Grid>
    </Grid>
  );
}