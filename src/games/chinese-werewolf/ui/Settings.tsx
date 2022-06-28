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

  const handleChange = name => event => {
    client.emit('settings', { extra: { [name]: event.target.checked } });
  };

  const { selectionTermsOnly, spectatorsSeeIdentity, deadSeeIdentity, randomThreeDivine, doubleIdentity, hiddenChanges } = settings.setupData.extra;
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
            <Tooltip
              title={'若钩此选项聊天室则只能使用特定选项词语交流'}
            >
              <FormControlLabel
                control={<Checkbox checked={selectionTermsOnly} onChange={handleChange('selectionTermsOnly')} value="selectionTermsOnly" />}
                label="聊天室选项词语"
              />
            </Tooltip>
            {/* <FormControlLabel
              control={<Checkbox checked={spectatorsSeeIdentity} onChange={handleChange('spectatorsSeeIdentity')} value="spectatorsSeeIdentity" />}
              label="观众看得到身份"
            /> */}
            <FormControlLabel
              control={<Checkbox checked={deadSeeIdentity} onChange={handleChange('deadSeeIdentity')} value="deadSeeIdentity" />}
              label="死亡看得到身份"
            />
            <Tooltip
                title={'从选定的角色中随机选择3个神，所有民，所有普狼，并且除了普狼以外的狼随机抽取至总共3个狼，以及如果有选定第三方随机抽取一个第三方'}
            >
              <FormControlLabel
                control={<Checkbox checked={randomThreeDivine} onChange={handleChange('randomThreeDivine')} value="randomThreeDivine" />}
                label="5随3"
              />
            </Tooltip>
            <FormControlLabel
              control={<Checkbox checked={doubleIdentity} onChange={handleChange('doubleIdentity')} value="doubleIdentity" />}
              label="双身份"
            />
            {
              self && self.host
                ? <Tooltip
                    title={'【只有Host看得到的选项】若钩此选项其他人看不到设定改变'}
                  >
                    <FormControlLabel
                      control={<Checkbox checked={hiddenChanges} onChange={handleChange('hiddenChanges')} value="hiddenChanges" />}
                      label="私改"
                    />
                  </Tooltip>
                : null
            }
          </FormGroup>
        </FormControl>
      </div>
    </React.Fragment>
  );
}

const usePresetSettingsStyle = makeStyles(theme => ({
    presetSettings: {
      display: 'flex',
    }
  }));
  
function PresetSettings({ self, settings, preset, setPreset }) {
  const [client] = useContext(ClientContext);

  const classes = usePresetSettingsStyle();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreset(event.target.value);
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
            label="角色预设"
            value={preset}
            onChange={handleChange}
            helperText="常用的角色预设"
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
    maxHeight: 184.73
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

function CardGrid({ self, settings, setPreset }) {
  const [client] = useContext(ClientContext);

  const classes = useCardStyles();

  const handleChange = (id, value) => {
    setPreset('');
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

  const hidden = settings.setupData.extra.hiddenChanges && (!self || !self.host);

  const town = hidden ? 0 : settings.static.cards.town.reduce((count, card) => count + settings.setupData.cards.filter((cid) => cid === card.id).length, 0);
  const wolves = hidden ? 0 : settings.static.cards.wolves.reduce((count, card) => count + settings.setupData.cards.filter((cid) => cid === card.id).length, 0);
  const neutral = hidden ? 0 : settings.static.cards.neutral.reduce((count, card) => count + settings.setupData.cards.filter((cid) => cid === card.id).length, 0);

  return (
    <React.Fragment>
      <Container className={classes.container} maxWidth="md">
        <Paper square elevation={0} className={classes.header}>
          <Typography>好人 ({town})</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.town.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0 && !hidden;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    {card.img ?
                      <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} /> :
                      <Avatar className={selectedCard ? classes.selectedImage : classes.image} variant='rounded'>{card.label}</Avatar>
                    }
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label={`${card.label} 数量`}
                    type="number"
                    value={hidden ? 0 : value}
                    onChange={(e) => { handleChange(card.id, e.target.value) }}
                    disabled={disabled}
                />
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>狼人 ({wolves})</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.wolves.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0 && !hidden;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    {card.img ?
                      <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} /> :
                      <Avatar className={selectedCard ? classes.selectedImage : classes.image} variant='rounded'>{card.label}</Avatar>
                    }
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label={`${card.label} 数量`}
                    type="number"
                    value={hidden ? 0 : value}
                    onChange={(e) => { handleChange(card.id, e.target.value) }}
                    disabled={disabled}
                />
              </Grid>
            );
          })}
        </Grid>
        <Paper square elevation={0} className={classes.header}>
          <Typography>第三方 ({neutral})</Typography>
        </Paper>
        <Grid container spacing={2}>
          {settings.static.cards.neutral.map((card) => {
            const value = settings.setupData.cards.filter((cid) => cid === card.id).length;
            const selectedCard = value > 0 && !hidden;
            return (
              <Grid item key={card.id}>
                <Card className={classes.card}>
                  <CardActionArea disabled={true}>
                    {card.img ?
                      <img
                      src={card.img}
                      alt={card.id}
                      className={selectedCard ? classes.selectedImage : classes.image} /> :
                      <Avatar className={selectedCard ? classes.selectedImage : classes.image} variant='rounded'>{card.label}</Avatar>
                    }
                  </CardActionArea>
                </Card>
                <TextField
                    id="outlined-number"
                    label={`${card.label} 数量`}
                    type="number"
                    value={hidden ? 0 : value}
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

  const [preset, setPreset] = useState('');

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
                <PresetSettings self={self} settings={room.ctx.settings} preset={preset} setPreset={setPreset} />
            </Paper>
        </Grid>
        {/* Cards */}
        <CardGrid self={self} settings={room.ctx.settings} setPreset={setPreset} />
    </Grid>
  );
}