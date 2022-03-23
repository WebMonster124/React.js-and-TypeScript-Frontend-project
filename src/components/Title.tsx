import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  title: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 20,
  },
});

interface Props {
  title: string;
  className?: string;
}

const Title: React.FC<Props> = ({ title, className }) => {
  const classes = useStyles();
  return (
    <Typography variant="h2" className={classes.title + ' ' + className}>
      {title}
    </Typography>
  );
};

export default Title;
