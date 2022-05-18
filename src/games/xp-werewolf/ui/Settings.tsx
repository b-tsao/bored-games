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
            </Paper>
        </Grid>
    </Grid>
  );
}