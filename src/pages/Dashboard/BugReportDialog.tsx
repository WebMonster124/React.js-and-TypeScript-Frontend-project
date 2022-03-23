import React, { useState } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';

import { postFeedback } from '../../services/api/feedback';
import { RootState } from '../../redux';

const useStyles = makeStyles((theme) => ({
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
    padding: 0,
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
    margin: theme.spacing(1),
    color: 'white',
  },
}));

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

interface DialogContentProps {
  graphicId: string;
  user: any;
  onClose(): void;
}

const DialogContent: React.FC<DialogContentProps> = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const { graphicId, user, onClose, ...other } = props;

  const submitBugReport = async () => {
    try {
      await postFeedback({
        userName: user?.attributes?.name,
        userEmail: user?.attributes?.email,
        message: message,
        feedbackMessage: message,
        graphicId: graphicId,
        feedbackType: 'Bug Report',
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MuiDialogContent dividers className={classes.content} {...other}>
      <form className={classes.form}>
        <TextField
          className={classes.textfield}
          id="outlined-textarea"
          label={t('bug_report.message_hint')}
          multiline
          rows={8}
          variant="outlined"
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
        />
        <Button
          className={classes.submit}
          variant="contained"
          color="primary"
          size="large"
          onClick={() => submitBugReport()}>
          {t('bug_report.submit')}
        </Button>
      </form>
    </MuiDialogContent>
  );
};

interface Props extends StateProps {
  open: boolean;
  graphicId: string;
  onClose(): void;
}

const BugReportDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose()}
      maxWidth="sm"
      fullWidth>
      <DialogTitle onClose={() => props.onClose()}>
        {t('bug_report.header')}
      </DialogTitle>
      <DialogContent
        graphicId={props.graphicId}
        user={props.user}
        onClose={() => props.onClose()}
      />
    </Dialog>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(BugReportDialog);
