import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  beta: {
    zIndex: 10000,
    position: 'absolute',
    bottom: 24,
    right: 48,
    pointerEvents: 'none',
    opacity: 0.12,
  },
  h1: {
    margin: 0,
    fontSize: 40,
  },
});

const Beta: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.beta}>
      <h1 className={classes.h1}>Beta</h1>
    </div>
  );
};

export default Beta;
