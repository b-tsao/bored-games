import React, { useState, useRef } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { TextInput } from "./components/TextInput";
import { Autocomplete } from "@material-ui/lab";
import { Chip } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    picker: {
      width: "100%"
    },
    options: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      }
    }
  })
);

export default function SelectionInput({ options, onSubmit, disabled, label, placeholder }) {
  const classes = useStyles();

  const textInputRef = useRef<any>(null);
  const [selected, setSelected] = useState<any[]>([]);

  const handleSelect = (s) => {
    setSelected([...selected, s]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Backspace' && selected.length > 0) {
      setSelected(selected.slice(0, selected.length - 1));
    }
  };

  const handleSubmit = () => {
    onSubmit(selected.join(' '));
    setSelected([]);
    textInputRef.current.blur();
  };

  return (
    <Autocomplete
      className={classes.picker}
      multiple
      id="chat-selection-picker"
      size="small"
      openOnFocus
      inputValue=""
      value={selected}
      options={options}
      noOptionsText="无词语"
      groupBy={(option) => option.group}
      getOptionLabel={() => ''}
      disableCloseOnSelect
      disabled={disabled}
      getOptionSelected={() => false}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option}
            size="small"
            {...getTagProps({ index })}
            onDelete={undefined}
          />
        ))
      }
      renderOption={(option) => (
        <div className={classes.options}>
          {
            option.selections.map((label, idx) => (
              <Chip
                key={idx}
                variant="outlined"
                label={label}
                onClick={() => handleSelect(label)}
              />
            ))
          }
        </div>
      )}
      renderInput={(params) => (
        <TextInput
          {...params}
          inputRef={textInputRef}
          variant="filled"
          onSubmit={handleSubmit}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            readOnly: true
          }}
        />
      )}
      onKeyDown={handleKeyPress}
    />
  );
}
