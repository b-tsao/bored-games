import React from "react";

import CasinoTwoToneIcon from "@material-ui/icons/CasinoTwoTone";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Box, Typography } from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        width: 500,
        position: "relative",
        background: (props) =>
            props.current
                ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.7) 90%, rgba(255,255,255,0) 100%)"
                : "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.2) 90%, rgba(255,255,255,0) 100%)",
        color: "white",
    },
    icons: {
        width: 50,
        textAlign: "right",
        // Center vertically in profile bar.
        position: "absolute",
        left: 60,
        top: "50%",
        transform: "translate(0, -50%)",
    },
    current: {
        background: "rgba(0,200,0,0.5)",
    },
});

export function PlayerInfoCard(props) {
    const classes = useStyles(props);

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            px={15}
            className={classes.root}
        >
            <Box className={classes.icons}>
                {props.dice === true && <CasinoTwoToneIcon />}
                {props.dealer === true && <PlayArrowRoundedIcon />}
            </Box>
            <Box display="flex" alignItems="center">
                <Avatar variant="square">
                    {props.name ? props.name.charAt(0) : "?"}
                </Avatar>
                <Box ml={2}>
                    <Typography>{props.name}</Typography>
                </Box>
            </Box>
            <Box display="flex" alignItems="center">
                <Typography>{props.wind}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                <Typography>{props.points}</Typography>
            </Box>
        </Box>
    );
}
