import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  card: {
    width: 218,
    height: 250,
    marginBottom: 10,
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      width: 270,
      height: 250,
      marginBottom: 10,
      position: 'relative'
    }
  },
  header: {
    width: '100%'
  },
  title: {
    fontSize: 14,
  },
  imageHolder: {
    textAlign: 'center',
    flexGrow: 1
  },
  image: {
    maxWidth: 120,
    maxHeight: 120
  },
  content: {
    width: '100%'
  },
  action: {
    position: 'static',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
}));

export default function GameCard(props) {
  const classes = useStyles();

  const deadCard = (
    <Card className={classes.card}>
      <div className={classes.action}>
        <CardHeader
          className={classes.header}
          subheader={props.title}
        />
        <div className={classes.imageHolder}>
          <img
            src={props.image}
            alt={props.title}
            className={classes.image} />
        </div>
        <CardContent className={classes.content}>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p">
            {props.subtitle}
          </Typography>
        </CardContent>
      </div>
    </Card>
  );

  const gameCard = (
    <Card className={classes.card}>
      <CardActionArea
        onClick={() => { props.onClick(deadCard) }}
        className={classes.action}>
        <CardHeader
          className={classes.header}
          subheader={props.title}
        />
        <div className={classes.imageHolder}>
          <img
            src={props.image}
            alt={props.title}
            className={classes.image} />
        </div>
        <CardContent className={classes.content}>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p">
            {props.subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  return gameCard;
}

GameCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  onClick: PropTypes.func
}