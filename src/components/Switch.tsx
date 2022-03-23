import React, { ReactNode } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import BaseSwitch, { SwitchProps } from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { green } from '@material-ui/core/colors';

const PurpleSwitch = withStyles({
  root: {
    marginRight: -5,
  },
  switchBase: {
    color: green[300],
    '&$checked': {
      color: green[500],
    },
    '&$checked + $track': {
      backgroundColor: green[500],
    },
  },
  checked: {},
  track: {},
})(BaseSwitch);

const useStyles = makeStyles((theme) => ({
  switchControl: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  switchLabel: {
    flexGrow: 1,
    flexShrink: 1,
  },
}));

interface Props extends SwitchProps {
  label: ReactNode;
  className?: string;
}

const Switch: React.FC<Props> = ({ label, className, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.switchControl + (className ? ' ' + className : '')}>
      <Typography
        component="span"
        variant="body1"
        className={classes.switchLabel}>
        {label}
      </Typography>
      <PurpleSwitch {...props} />
    </div>
  );
};

export default Switch;
