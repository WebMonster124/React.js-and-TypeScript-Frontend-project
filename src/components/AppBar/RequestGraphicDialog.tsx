import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
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

import { RootModel, RootState } from '../../redux';
import { AuthUser } from '../../types';

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

interface TitleProps {
  onClose(): void;
}

const DialogTitle: React.FC<TitleProps> = (props) => {
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

interface ContentProps extends DispatchProps {
  user: AuthUser;
  onClose(): void;
}

const DialogContent: React.FC<ContentProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { user, onClose, postFeedback, ...other } = props;
  const [message, setMessage] = useState('');

  const submitRequest = () => {
    postFeedback({
      userName: user?.attributes?.name,
      userEmail: user?.attributes?.email,
      message: message,
      feedbackMessage: message,
      graphicId: 'new-graphic-request',
      feedbackType: 'Graphic Request',
    });
    onClose();
  };

  return (
    <MuiDialogContent dividers className={classes.content} {...other}>
      <form className={classes.form}>
        <TextField
          className={classes.textfield}
          id="outlined-textarea"
          label={t('request_graphic.hint')}
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
          onClick={() => submitRequest()}>
          {t('request_graphic.submit')}
        </Button>
      </form>
    </MuiDialogContent>
  );
};

interface Props extends StateProps, DispatchProps {
  open?: boolean;
  onClose?(): void;
}

const RequestGraphicDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose()}
      maxWidth="sm"
      fullWidth>
      <DialogTitle onClose={() => props.onClose?.()}>
        {t('request_graphic.header')}
      </DialogTitle>
      <DialogContent
        user={props.user}
        onClose={() => props.onClose()}
        postFeedback={props.postFeedback}
      />
    </Dialog>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  postFeedback: dispatch.feedback.postFeedback,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(RequestGraphicDialog);
