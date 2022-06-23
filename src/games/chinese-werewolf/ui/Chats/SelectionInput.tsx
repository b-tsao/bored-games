import React, { useState } from "react";
import { alpha, createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { TextInput } from "./components/TextInput";
import { Autocomplete } from "@material-ui/lab";
import { Chip } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    picker: {
      width: "100%"
    }
  })
);

export default function SelectionInput({ options, onSubmit, disabled, label, placeholder }) {
  const classes = useStyles();

  const [selected, setSelected] = useState<any[]>([]);

  const handleChange = (e, v) => {
    setSelected(v);
  };

  const handleSubmit = () => {
    onSubmit(selected.map((s) => s.label).join(' '));
    setSelected([]);
  };

  return (
    <Autocomplete
      className={classes.picker}
      multiple
      id="chat-selection-picker"
      size="small"
      openOnFocus
      value={selected}
      options={options}
      noOptionsText='无词语'
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      onChange={handleChange}
      disableCloseOnSelect
      disabled={disabled}
      getOptionSelected={() => false}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option.label}
            size="small"
            {...getTagProps({ index })}
            onDelete={undefined}
          />
        ))
      }
      renderInput={(params) => (
        <TextInput {...params} variant="filled" onSubmit={handleSubmit} label={label} placeholder={placeholder} />
      )}
    />
  );
}
