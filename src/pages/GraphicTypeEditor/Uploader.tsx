import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import MButton from '@material-ui/core/Button';
import get from 'lodash/get';

import { getSignedUrl } from '../../services/api';
import { GraphicType } from '../../types';
import { RootState } from '../../redux';
import { notifyBundleJsUpload } from '../../services/zapier';
import { getUserAttributes } from '../../utils/user';

Dropzone.autoDiscover = false;

const defaultOptions = {
  method: 'put',
  resizeWidth: 600,
  resizeHeight: 600,
  resizeMethod: 'crop',
  maxFiles: 1,
};

interface Props extends StateProps {
  graphicType: GraphicType;
  property: string;
  confirmRequired?: boolean;
  onSuccess?(): void;
}

const Uploader: React.FC<Props> = (props) => {
  const dropzoneRef = useRef<HTMLDivElement>();
  const dropzone = useRef<Dropzone>();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen((o) => !o);
  const { graphicType, property, confirmRequired, onSuccess } = props;
  useEffect(() => {
    if (!dropzone.current)
      getSignedUrl(graphicType.graphicTypeId, property).then((url) => {
        if (dropzoneRef.current) {
          const dz = new Dropzone(dropzoneRef.current, {
            url,
            ...(defaultOptions as any),
            autoProcessQueue: !confirmRequired,
          });
          dz.on('addedfile', () => {
            if (confirmRequired) setOpen(true);
          });
          dz.on('success', () => {
            if (onSuccess) {
              onSuccess();
            }
          });
          dz.on('complete', () => {
            setTimeout(() => {
              const { graphicTypeId, graphicTypeName } = graphicType;
              const userAttributes = getUserAttributes(props.user);
              const author = get(userAttributes, 'name', '');
              notifyBundleJsUpload(graphicTypeId, graphicTypeName, author);
              if (dz) {
                dz.removeAllFiles();
              }
            }, 1000);
          });
          (dz as any).submitRequest = (xhr, formData) => {
            if (formData.get('file')) xhr.send(formData.get('file'));
          };
          dropzone.current = dz;
        }
      });
  }, [property, graphicType, confirmRequired, onSuccess]);
  return (
    <>
      <div
        style={{ border: '1px dashed grey', marginBottom: 12 }}
        ref={dropzoneRef}
        className="dropzone"
      />
      {props.confirmRequired ? (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Replace Asset</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will replace the current asset.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <MButton onClick={handleClose}>Cancel</MButton>
            <MButton
              onClick={() => {
                handleClose();
                if (dropzone.current) dropzone.current.processQueue();
              }}>
              Ok
            </MButton>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(Uploader);
