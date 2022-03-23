import React, { useState, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import BugReportIcon from '@material-ui/icons/BugReport';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';

import logger from '../../utils/logger';
import { configToQuery, mergeConfig } from '../../utils/config';
import Preview from '../../components/Preview';
import VisualConfig from '../../components/VisualConfig';
import EmbedLinks from '../../components/EmbedLinks';
import BugReportDialog from './BugReportDialog';
import { Graphic, GraphicType } from '../../types';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  bugReportButton: {
    position: 'absolute',
    right: theme.spacing(6),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

interface DialogTitleProps {
  onBugReport(): void;
  onClose(): void;
}

const DialogTitle: React.FC<DialogTitleProps> = (props) => {
  const classes = useStyles();
  const { children, onBugReport, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onBugReport ? (
        <IconButton
          aria-label="bug-report"
          className={classes.bugReportButton}
          onClick={onBugReport}>
          <BugReportIcon />
        </IconButton>
      ) : null}
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
  graphicType: GraphicType;
  graphic: Graphic;
  open: boolean;
  onClose(): void;
}

const PreviewDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const { graphic, graphicType } = props;
  const { configOnline } = graphic || {};
  const { configDefault } = graphicType || {};

  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [previewQuery, setPreviewQuery] = useState('');
  const [width, setWidth] = useState(-1);
  const [height, setHeight] = useState(-1);

  useEffect(() => {
    const query = configToQuery(mergeConfig(configDefault, configOnline), true);
    setPreviewQuery(query);
  }, [configDefault, configOnline]);

  const handleConfigChange = useCallback(
    (config) => {
      logger.info('Dashboard/Preview/Config-Callback');
      if (typeof config === 'object') {
        const query = configToQuery(mergeConfig(configDefault, config), true);
        if (query !== previewQuery) {
          setPreviewQuery(query);
        }
      }
    },
    [previewQuery, configDefault]
  );

  return (
    <>
      <Dialog
        open={props.open}
        onClose={() => props.onClose()}
        maxWidth="md"
        fullWidth>
        <DialogTitle
          onBugReport={() => setBugReportOpen(true)}
          onClose={() => props.onClose()}>
          {t('graphic_preview.header')}
        </DialogTitle>
        <DialogContent dividers>
          {props.graphicType && props.graphic ? (
            <>
              <VisualConfig
                graphic={graphic}
                configDefault={graphicType?.configDefault}
                handleChange={handleConfigChange}
                disabledSave={true}
              />
              <EmbedLinks
                graphicId={graphic?.graphicId}
                query={previewQuery}
                width={width}
                height={height}
              />
              <Preview
                graphic={props.graphic}
                query={previewQuery || ''}
                wrapperId="viewer-preview-frame"
                changedWidth={setWidth}
                changedHeight={setHeight}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <BugReportDialog
        open={bugReportOpen}
        graphicId={props.graphic?.graphicId}
        onClose={() => setBugReportOpen(false)}
      />
    </>
  );
};

export default PreviewDialog;
