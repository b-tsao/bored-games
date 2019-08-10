import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
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
  title: {
    fontSize: 14,
  },
  imageHolder: {
    textAlign: 'center'
  },
  image: {
    maxWidth: 120,
    maxHeight: 120
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.6)'
  },
  action: {
    position: 'static'
  }
}));

export default function GameCard(props) {
  const classes = useStyles();
  
  const deadCard = (
    <Card className={classes.card}>
      <CardHeader
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
    </Card>
  );
  
  const gameCard = (
    <Card className={classes.card}>
      <CardActionArea
        onClick={() => {props.handleSelect({title: props.title, gameCard: deadCard})}}
        className={classes.action}>
        <CardHeader
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
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  handleSelect: PropTypes.func
}