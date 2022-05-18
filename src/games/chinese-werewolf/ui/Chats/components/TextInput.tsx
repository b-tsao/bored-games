import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapForm : {
        display: "flex",
        justifyContent: "center",
        width: "95%",
        margin: `${theme.spacing(0)} auto`
    },
    wrapText  : {
        width: "100%"
    },
    button: {
        //margin: theme.spacing(1),
    },
  })
);


export const TextInput = ({ onSubmit, disabled }) => {
    const classes = useStyles();

    const [message, setMessage] = useState('');

    const preventSubmission = (e) => {
        e.preventDefault();
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
    };

    const handleClick = (e) => {
        onSubmit(message);
        setMessage('');

        e.preventDefault();
    };

    const handleEnter = (e) => {
        if(e.keyCode == 13){
            onSubmit(message);
            setMessage('');
         }
    };

    return (
        <>
            <form className={classes.wrapForm}  noValidate autoComplete="off" onSubmit={preventSubmission}>
            <TextField
                id="standard-text"
                // label="メッセージを入力"
                label="输入信息"
                className={classes.wrapText}
                //margin="normal"
                value={message}
                onChange={handleChange}
                onKeyDown={handleEnter}
                disabled={disabled}
            />
            <Button variant="contained" color="primary" className={classes.button} onClick={handleClick} disabled={disabled}>
                <SendIcon />
            </Button>
            </form>
        </>
    )
}



