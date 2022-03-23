import React from 'react';
import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    display: 'flex',
  },
  iframe: {
    flexGrow: 1,
    border: 'none',
  },
}));

const Monitor = () => {
  const classes = useStyles();
  const monitorUrl = `https://p.datadoghq.eu/sb/cs3prplpvd80bgag-22d0c60c3c7f0cb75067d157449a22ea?from_ts=1617612376181&live=true&theme=light&to_ts=1617785176181&tv_mode=false`;

  return (
    <div className={classes.root}>
      <iframe className={classes.iframe} title="Monitor" src={monitorUrl} />
    </div>
  );
};

export default Monitor;
