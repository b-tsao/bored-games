import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardActionArea from '@material-ui/core/CardActionArea';

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
      marginLeft: 10,
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

  return (
    <Card key={props.id} className={classes.card}>
      <CardActionArea
        onClick={props.handleSelect}
        className={classes.action}>
        <CardHeader
          subheader={props.title}
        />
        <div className={classes.imageHolder}>
          <img
            src={window.location.origin + props.image}
            alt={props.title}
            className={classes.image} />
        </div>
        <CardContent className={classes.content}>
          <Typography variant="body2" color="textSecondary" component="p">
            {props.subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

GameCard.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  handleSelect: PropTypes.func
}