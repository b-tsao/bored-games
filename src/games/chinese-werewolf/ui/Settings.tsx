import React, { useState, useContext } from 'react';
import clsx from 'clsx';
import {
  makeStyles,
} from '@material-ui/core/styles';

import {
  Card,
  CardActionArea,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Paper,
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

  const handleChange = name => event => {
    client.emit('settings', { extra: { [name]: event.target.checked } });
  };

//   const { enableHistory, spectatorsSeeIdentity, evilClarivoyance } = settings.extra;
  const { enableHistory, spectatorsSeeIdentity, evilClarivoyance } = {enableHistory: true, spectatorsSeeIdentity: true, evilClarivoyance: true};
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
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={enableHistory} onChange={handleChange('enableHistory')} value="enableHistory" />}
              label="Enable history"
            />
            <FormControlLabel
              control={<Checkbox checked={spectatorsSeeIdentity} onChange={handleChange('spectatorsSeeIdentity')} value="spectatorsSeeIdentity" />}
              label="Enable spectators to see everyone’s identity"
            />
            <FormControlLabel
              control={
                <Checkbox checked={evilClarivoyance} onChange={handleChange('evilClarivoyance')} value="evilClarivoyance" />
              }
              label="Enable evil to see each other’s vote"
            />
          </FormGroup>
        </FormControl>
      </div>
    </React.Fragment>
  );
}

const useCardStyles = makeStyles(theme => ({
  container: {
    paddingLeft: 0,
    paddingRight: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },
  card: {
    display: 'flex',
    maxWidth: 127.66,
    maxHeight: 198.77
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
    filter: 'alpha(opacity=50)', /* For IE8 and earlier */
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    opacity: 1.0,
    filter: 'alpha(opacity=100)', /* For IE8 and earlier */
  }
}));

function CardGrid({ self, settings }) {
  const [client] = useContext(ClientContext);

  const classes = useCardStyles();

  const handleSelect = (side, cardIdx) => {
    let selectedCards = settings.selectedCards[side];
    const idx = selectedCards.indexOf(cardIdx);
    if (idx < 0) {
      selectedCards = [...selectedCards, cardIdx];
    } else {
      selectedCards = [...selectedCards.slice(0, idx), ...selectedCards.slice(idx + 1)];
    }
    client.emit('settings', { selectedCards: { [side]: selectedCards } });
  };

  const disabled = !self || !self.host;

  return (
    <React.Fragment>
      <Container className={classes.container} maxWidth="md">
        <Paper square elevation={0} className={classes.header}>
          <Typography>Town</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.town.map((card, idx) => {
            const selectedCard = true;
            const disabledGood = false;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea
                    disabled={disabledGood}
                    onClick={() => { handleSelect('good', idx) }}>
                    <img
                      src={card.img}
                      alt={card.label}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>Wolves</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.wolves.map((card, idx) => {
            const selectedCard = false;
            const disabledEvil = true;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea
                    disabled={disabledEvil}
                    onClick={() => { handleSelect('evil', idx) }}>
                    <img
                      src={card.img}
                      alt={card.label}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
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

export function ChineseWerewolfSettings({ room, self }) {
  console.log('settings', room, self);

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
        {/* Cards */}
        <CardGrid self={self} settings={room.ctx.settings} />
    </Grid>
  );
}