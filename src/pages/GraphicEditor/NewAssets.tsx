import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import Dropzone, { DropzoneFile } from 'dropzone';
import 'dropzone/dist/dropzone.css';
import { useTranslation } from 'react-i18next';

import { RootModel } from '../../redux';
import { Graphic } from '../../types';
import { getAssetSignedUrl } from '../../services/api';
import logger from '../../utils/logger';
Dropzone.autoDiscover = false;

const defaultOptions = {
  method: 'put',
  autoProcessQueue: false,
  addRemoveLinks: true,
};

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  dialogcontent: {
    width: 600,
  },
  title: {
    fontSize: 19,
    fontFamily: 'Playfair Display',
    fontWeight: 400,
  },
  dialog: {},
  dialogActions: {},
}));

interface File extends DropzoneFile {
  uploadUrl: string;
}

interface Props extends DispatchProps {
  open: boolean;
  graphic: Graphic;
  requestClose(): void;
}

const NewAsset = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { loadAssets, requestClose, graphic } = props;

  const [active, setActive] = useState(false);
  const [dropzoneRef, setDropzoneRef] = useState<HTMLFormElement>(); // need to use state for rerender
  const dropzone = useRef<Dropzone>();

  const handleUpload = () => {
    logger.info('NewAsset/Dropzone/Upload-Handler');
    if (dropzone.current) {
      logger.debug('Processing dropzone queue');
      dropzone.current.processQueue();
    }
  };

  useEffect(() => {
    if (dropzoneRef) {
      let dz = dropzoneRef.dropzone;
      if (!dz) {
        dz = new Dropzone(dropzoneRef, {
          // TODO check this
          url: (files: File[]) => {
            if (files.length) return files[0].uploadUrl;
            return '';
          },
          ...defaultOptions,
        });
        // TODO implement this correctly
        (dz as any).submitRequest = function (xhr, formData) {
          console.log('submitRequest');
          if (formData.get('file')) xhr.send(formData.get('file'));
        };
      }
      const addedfile = (file: File) => {
        logger.info('NewAsset/Dropzone/AddedFile-Handler');
        setActive(false);
        if (graphic && graphic.graphicId)
          logger.debug('Getting url to upload to', {
            graphic: graphic.graphicId,
          });
        getAssetSignedUrl(graphic.graphicId, file.name).then((url) => {
          logger.debug('Setting the received url to dropzone', {
            uploadUrl: url,
            graphic: graphic.graphicId,
          });
          file.uploadUrl = url;
          setActive(true);
        });
      };
      const queuecomplete = () => {
        logger.info('NewAsset/Dropzone/QueueComplete-Handler');
        requestClose();
        logger.debug('reloading assets');
        setTimeout(() => loadAssets(graphic.graphicId), 2000);
      };
      const complete = () => {
        logger.info('NewAsset/Dropzone/Complete-Handler');
        logger.debug('Starting processing');
        dz.processQueue();
      };
      dz.on('addedfile', addedfile);
      dz.on('complete', complete);
      dz.on('queuecomplete', queuecomplete);
      dropzone.current = dz;
      return () => {
        dz.off('queuecomplete', queuecomplete);
        dz.off('complete', complete);
        dz.off('addedfile', addedfile);
      };
    }
  });

  return (
    <Dialog
      className={classes.dialog}
      open={props.open}
      onClose={props.requestClose}>
      <DialogTitle className={classes.title}>
        {t('assets_add.title')}
      </DialogTitle>
      <DialogContent className={classes.dialogcontent}>
        <form
          style={{ border: '1px dashed grey', marginBottom: 12 }}
          ref={(el) => setDropzoneRef(el)}
          className="dropzone"
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={props.requestClose}>{t('assets_add.cancel')}</Button>
        <Button disabled={!(dropzone && active)} onClick={handleUpload}>
          {t('assets_add.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  loadAssets: dispatch.assets.loadAssets,
});

type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(() => ({}), mapDispatch)(NewAsset);
