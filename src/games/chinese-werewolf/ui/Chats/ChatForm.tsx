import React, { useState, useRef, useEffect } from 'react';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { Box, Checkbox, Paper, FormControl, FormLabel, FormGroup, FormControlLabel, FormHelperText, TextField, Button } from '@material-ui/core';
import Cards, { Side } from '../../game/cards';

function getPlayerSide(player) {
    let neutral = false;
    for (const role of player.roles) {
        if (Cards[role].side === Side.Wolves) {
            return Side.Wolves;
        } else if (Cards[role].side === Side.Neutral) {
            neutral = true;
        }
    }
    return neutral ? Side.Neutral : Side.Town;
}

const useTitleFieldStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    field: {
        flexGrow: 1
    },
    button: {
        height: '50%'
    }
}));

function TitleField({ error, title, helperText, onChange, onSubmit }) {
    const classes = useTitleFieldStyles();

    return (
        <div className={classes.root}>
            <TextField
                className={classes.field}
                inputProps={{ autoComplete: 'off' }}
                error={error}
                id="chatroom-name"
                label="聊天室名称"
                variant="outlined"
                value={title}
                helperText={helperText}
                onChange={onChange}
            />
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={onSubmit}
            >
                创造
            </Button>
        </div>
    );
}

const useCheckboxesGroupStyles = makeStyles((theme) => ({
    root: {
        display: 'flex'
    },
    formControl: {
        flexGrow: 1,
        alignItems: 'center'
    },
}));

function CheckboxesGroup({ playerID, players, selected, onSelect }) {
    const classes = useCheckboxesGroupStyles();

    const handleChange = (event) => {
        const { name, checked } = event.target;
        onSelect(name, checked);
    };

    const town = Object.keys(players).filter((pid) => pid !== playerID && getPlayerSide(players[pid]) === Side.Town);
    const wolves = Object.keys(players).filter((pid) => pid !== playerID && getPlayerSide(players[pid]) === Side.Wolves);
    const neutral = Object.keys(players).filter((pid) => pid !== playerID && getPlayerSide(players[pid]) === Side.Neutral);

    return (
        <React.Fragment>
            <FormHelperText component="legend">选择进入聊天室的玩家</FormHelperText>
            <div className={classes.root}>
                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel>好人</FormLabel>
                    <FormGroup>
                        {town.map((pid, idx) => (
                            <FormControlLabel
                                key={idx}
                                control={<Checkbox checked={selected[pid] || false} onChange={handleChange} name={pid} />}
                                label={`${pid} (${players[pid].roles.map((role) => Cards[role].label)})`}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel>狼人</FormLabel>
                    <FormGroup>
                        {wolves.map((pid, idx) => (
                            <FormControlLabel
                                key={idx}
                                control={<Checkbox checked={selected[pid] || false} onChange={handleChange} name={pid} />}
                                label={`${pid} (${players[pid].roles.map((role) => Cards[role].label)})`}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel>第三方</FormLabel>
                    <FormGroup>
                        {neutral.map((pid, idx) => (
                            <FormControlLabel
                                key={idx}
                                control={<Checkbox checked={selected[pid] || false} onChange={handleChange} name={pid} />}
                                label={`${pid} (${players[pid].roles.map((role) => Cards[role].label)})`}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </div>
        </React.Fragment>
    );
}

const useStyles = makeStyles((theme) => ({
  chatWindow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: alpha(theme.palette.background.default, .7)
  },
  chat: {
    // Allow messages to scroll properly.
    height: 0,
    overflowY: 'auto'
  },
  "@global": {
    ".messages": {
      "& div:first-child": {
        marginTop: "0 !important"
      }
    }
  },
  rounding: {
    borderRadius: 8,
  }
}));

function ChatForm({ className, playerID, players, onSubmit }) {
  const classes = useStyles();

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({});

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
      onSubmit(title.trim(), [playerID, ...Object.keys(selected).filter((pid) => selected[pid])], (e) => {
          if (e) {
            setTitle(title.trim());
            setError(e);
          } else {
            setTitle('');
            setError('');
            setSelected({});
          }
      });
  };

  const handleSelect = (key, value) => {
      setSelected({
          ...selected,
          [key]: value
      });
  };

  return (
    <Box className={className} display="flex" flexDirection="column" flex={2}>
      <Paper className={classes.chatWindow} classes={{ rounded: classes.rounding }} elevation={24}>
        <Box className={classes.chat} display="flex" flexDirection="column" flexGrow={1}>
          <Box display="flex" flexDirection="column" flex={1} padding={1}>
            <TitleField
                error={!!error}
                title={title}
                helperText={error}
                onChange={handleTitleChange}
                onSubmit={handleSubmit}
            />
            <CheckboxesGroup
                playerID={playerID}
                players={players}
                selected={selected}
                onSelect={handleSelect}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatForm;
