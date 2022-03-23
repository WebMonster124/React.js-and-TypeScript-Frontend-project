import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    content: {
      margin: 0,
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    form: {
      margin: 0,
      padding: theme.spacing(1),
      display: 'flex',
      flexDirection: 'column',
    },
    textfield: {
      margin: theme.spacing(1),
    },
    submit: {
      color: 'white',
    },
  })
);

interface DialogTitleProps {
  onClose(): void;
}

const DialogTitle: React.FC<DialogTitleProps> = (props) => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.title} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

type Destination = 'dataTest' | 'dataOnline' | 'dataTest,dataOnline';
type IntervalUnit = 'minutes' | 'hours' | 'days' | 'months';

interface DialogContentProps {
  interval: number;
  destination: Destination;
  onSubmit(args: { destination: Destination; minutes: number }): void;
  onClose(): void;
}

const DialogContent: React.FC<DialogContentProps> = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const { onClose, onSubmit, ...other } = props;

  const [destination, setDestination] = useState<Destination>('dataTest');
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('minutes');
  const [intervalAmount, setIntervalAmount] = useState(1);

  useEffect(() => {
    const minutes = props.interval;
    setIntervalAmount(minutes);
    if (minutes % (60 * 24 * 30) === 0) {
      setIntervalUnit('months');
      setIntervalAmount(minutes / 60 / 24 / 30);
    } else if (minutes >= 60 * 24) {
      setIntervalUnit('days');
      setIntervalAmount(minutes / 60 / 24);
    } else if (minutes >= 60) {
      setIntervalUnit('hours');
      setIntervalAmount(minutes / 60);
    } else {
      setIntervalUnit('minutes');
      setIntervalAmount(minutes);
    }
  }, [props.interval]);

  useEffect(() => {
    setDestination(props.destination);
  }, [props.destination]);

  const updateSettings = async () => {
    try {
      let minutes = intervalAmount;
      if (intervalUnit === 'hours') minutes *= 60;
      if (intervalUnit === 'days') minutes *= 60 * 24;
      if (intervalUnit === 'months') minutes *= 60 * 24 * 30;
      onSubmit({ destination, minutes });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MuiDialogContent dividers className={classes.content} {...other}>
      <FormControl variant="outlined">
        <InputLabel id="destination-select-label">Destination</InputLabel>
        <Select
          labelId="destination-select-label"
          id="destination-select"
          value={destination}
          onChange={(ev) => setDestination(ev.target.value as Destination)}
          label="Destination">
          <MenuItem value="dataTest">Data Test</MenuItem>
          <MenuItem value="dataOnline">Data Online</MenuItem>
          <MenuItem value="dataTest,dataOnline">
            Data Test and Data Online
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined">
        <InputLabel id="interval-unit-select-label">Interval Unit</InputLabel>
        <Select
          labelId="interval-unit-select-label"
          id="interval-unit-select"
          value={intervalUnit}
          onChange={(ev) => setIntervalUnit(ev.target.value as IntervalUnit)}
          label="Interval Unit">
          <MenuItem value="months">Months</MenuItem>
          <MenuItem value="days">Days</MenuItem>
          <MenuItem value="hours">Hours</MenuItem>
          <MenuItem value="minutes">Minutes</MenuItem>
        </Select>
      </FormControl>
      <TextField
        variant="outlined"
        value={intervalAmount}
        onChange={(ev) => {
          const n = Number(ev.target.value);
          if (isNaN(n)) setIntervalAmount(0);
          else setIntervalAmount(Number(ev.target.value));
        }}
        label="Interval Amount"
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      />
      <Button
        className={classes.submit}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => updateSettings()}>
        {t('data_function_options.submit')}
      </Button>
    </MuiDialogContent>
  );
};

interface Props extends DialogContentProps {
  open: boolean;
}

const DataFunctionSettingsDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose()}
      maxWidth="xs"
      fullWidth>
      <DialogTitle onClose={props.onClose}>
        {t('data_function_options.header')}
      </DialogTitle>
      <DialogContent
        interval={props.interval}
        destination={props.destination}
        onSubmit={props.onSubmit}
        onClose={props.onClose}
      />
    </Dialog>
  );
};

export default DataFunctionSettingsDialog;
