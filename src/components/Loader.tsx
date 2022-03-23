import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  main: {
    margin: '0 auto',
  },
}));

interface Props {
  size: number;
}

const Loader: React.FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.main}>
      <CircularProgress size={props.size} />
    </div>
  );
};

export default Loader;
