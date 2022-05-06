import React, { useContext, useState } from 'react';
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
  MenuItem,
  Paper,
  TextField,
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

  const { enableHistory, spectatorsSeeIdentity, doubleIdentity } = settings.setupData.extra;
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
            {/* <FormControlLabel
              control={<Checkbox checked={enableHistory} onChange={handleChange('enableHistory')} value="enableHistory" />}
              label="Enable history"
            />
            <FormControlLabel
              control={<Checkbox checked={spectatorsSeeIdentity} onChange={handleChange('spectatorsSeeIdentity')} value="spectatorsSeeIdentity" />}
              label="Enable spectators to see everyone’s identity"
            /> */}
            <FormControlLabel
              control={<Checkbox checked={doubleIdentity} onChange={handleChange('doubleIdentity')} value="doubleIdentity" />}
              label="双身分"
            />
          </FormGroup>
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
        setError("Can not set players below number of currently joined players");
      } else if (numPlayers > 20) {
        numPlayers = 20;
        setError("Too many players");
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
          label="Players"
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

const usePresetSettingsStyle = makeStyles(theme => ({
    presetSettings: {
      display: 'flex',
    }
  }));
  
function PresetSettings({ self, settings }) {
  const [client] = useContext(ClientContext);

  const classes = usePresetSettingsStyle();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const cards = JSON.parse(event.target.value);
      client.emit('settings', { cards });
  };

  const disabled = !self || !self.host;

  return (
    <React.Fragment>
      <div className={classes.presetSettings}>
        <TextField
            id="outlined-select-preset"
            select
            label="Preset"
            value=""
            onChange={handleChange}
            helperText="Please select a preset"
            disabled={disabled}
        >
        {Object.keys(settings.static.presets).map((preset, idx) => (
            <MenuItem key={idx} value={JSON.stringify(settings.static.presets[preset])}>
                {preset}
            </MenuItem>
        ))}
        </TextField>
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

  const handleChange = (id, value) => {
    if (value > 10) {
      value = 10;
    }
    const cards = settings.setupData.cards.filter((cid) => cid !== id);
    for (let i = 0; i < value; i++) {
        cards.push(id);
    }
    client.emit('settings', { cards });
  };

  const disabled = !self || !self.host;

  return (
    <React.Fragment>
      <Container className={classes.container} maxWidth="md">
        <Paper square elevation={0} className={classes.header}>
          <Typography>Town</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.town.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label="Count"
                    type="number"
                    value={value}
                    onChange={(e) => { handleChange(card.id, e.target.value) }}
                    disabled={disabled}
                />
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>Wolves</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.wolves.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label="Count"
                    type="number"
                    value={value}
                    onChange={(e) => { handleChange(card.id, e.target.value) }}
                    disabled={disabled}
                />
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>Neutral</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.neutral.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} />
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label="Count"
                    type="number"
                    value={value}
                    onChange={(e) => { handleChange(card.id, e.target.value) }}
                    disabled={disabled}
                />
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
        {/* Preset Settings */}
        <Grid item xs={12} md={6} lg={6}>
            <Paper className={paddedPaper}>
                <PlayerSettings self={self} players={room.ctx.players} settings={room.ctx.settings} />
                <PresetSettings self={self} settings={room.ctx.settings} />
            </Paper>
        </Grid>
        {/* Cards */}
        <CardGrid self={self} settings={room.ctx.settings} />
    </Grid>
  );
}