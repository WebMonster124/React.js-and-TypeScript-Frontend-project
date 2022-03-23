import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useRouteMatch } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MButton from '@material-ui/core/Button';
import { useTranslation } from 'react-i18next';

import { Graphic, GraphicType } from '../../types';
import { RootModel, RootState } from '../../redux';
import {
  getCodeKey,
  getOnlineCodeKey,
  getOnlineLastSavedByKey,
  getOnlineLastUpdateKey,
} from '../../utils/mapper';
import logger from '../../utils/logger';
import LogoIcon from './LogoIcon';
import Button from '../../components/Button';

const useStyles = makeStyles({
  copyContainer: {
    margin: '40px 0',
    textAlign: 'center',
  },
  copyButton: {
    paddingLeft: 36,
    paddingRight: 36,
  },
  startIcon: {
    fontSize: 32,
  },
  endIcon: {
    fontSize: 32,
  },
});

interface Props extends StateProps, DispatchProps {
  graphic: Graphic;
  graphicType: GraphicType;
}

const PublishButton = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const match = useRouteMatch('/:edit/:graphicTypeId/:g/:graphicId/:screen?');
  const {
    params: { screen = 'data' },
  } = match as { params: { screen?: string } };

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    logger.info('GraphicEditor/Publish/AlertCancel-Handler');
    setOpen((o) => !o);
  };

  return (
    <div className={classes.copyContainer}>
      <Button
        variant="contained"
        color="secondary"
        classes={{
          startIcon: classes.startIcon,
          endIcon: classes.endIcon,
        }}
        startIcon={<LogoIcon fontSize="inherit" />}
        endIcon={<LogoIcon fontSize="inherit" />}
        disabled={props.updating}
        onClick={() => setOpen(true)}
        className={classes.copyButton}>
        {t('publish_changes.button')}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t('publish_changes.header')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('publish_changes.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <MButton onClick={handleClose}>{t('publish_changes.cancel')}</MButton>
          <MButton
            onClick={() => {
              logger.info('GraphicEditor/Publish/AlertOk-Handler');
              logger.debug('Closing dialog');
              handleClose();
              const changesCodeKey = getOnlineCodeKey(screen);
              const changesSavedByKey = getOnlineLastSavedByKey(screen);
              const lastUpdateKey = getOnlineLastUpdateKey(screen);
              const changes = {
                [changesCodeKey]: props.graphic[getCodeKey(screen)],
                [changesSavedByKey]: props.user.username,
                [lastUpdateKey]: Date.now(),
              };
              logger.debug('Copying saved data to the online version', {
                screen,
                graphicType: props.graphicType,
                graphic: props.graphic,
                changesType: changesCodeKey,
              });
              props
                .updateGraphic({
                  graphicId: props.graphic.graphicId,
                  body: changes,
                })
                .catch((err) => {
                  logger.error('Error updating the graphic', { err });
                  enqueueSnackbar('Error publishing the graphic');
                });
            }}>
            {t('publish_changes.confirm')}
          </MButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  updating: state.loading.effects.graphic.updateGraphic,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  updateGraphic: dispatch.graphic.updateGraphic,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(PublishButton);
