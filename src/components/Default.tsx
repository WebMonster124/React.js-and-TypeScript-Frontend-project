import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import report from '../assets/report.png';

const useStyles = makeStyles({
  root: {
    width: '100%',
    minHeight: '100%',
    paddingTop: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    width: 600,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: 350,
    marginBottom: 75,
  },
  header: {
    marginBottom: 19,
    fontSize: 24,
    textAlign: 'center',
    fontFamily: '"Playfair Display", serif',
  },
  message: {
    fontSize: 17,
    color: '#a9a9a9',
    textAlign: 'center',
  },
});

interface Props {
  header: string;
  message: string;
}

const Default: React.FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <img
          className={classes.image}
          src={report}
          alt="Person in front of a chart"
        />
        <Typography variant="h2" className={classes.header}>
          {props.header}
        </Typography>
        <Typography variant="body1" className={classes.message}>
          {props.message}
        </Typography>
      </div>
    </div>
  );
};

export default Default;
