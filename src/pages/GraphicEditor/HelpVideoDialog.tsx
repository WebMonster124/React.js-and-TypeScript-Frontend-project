import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

interface DialogTitleProps {
  onClose(): void;
}

const DialogTitle: React.FC<DialogTitleProps> = (props) => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
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

interface Props {
  videoUrl: string;
  open: boolean;
  onClose(): void;
}

const HelpVideoDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      onClose={() => props.onClose()}
      maxWidth="md"
      fullWidth>
      <DialogTitle onClose={() => props.onClose()}>
        {t('graphic_version_editor.help_video')}
      </DialogTitle>
      <DialogContent dividers>
        <iframe
          title={t('graphic_version_editor.help_video')}
          src={`${props.videoUrl}?embed=true`}
          width="575"
          height="400"
          frameBorder="0"
          {...{ allowtransparency: 'true' }}
          allowFullScreen
          style={{ border: 'none', width: '100%' }}
          data-frame-src={`${props.videoUrl}?embed=true`}></iframe>
      </DialogContent>
    </Dialog>
  );
};

export default HelpVideoDialog;
