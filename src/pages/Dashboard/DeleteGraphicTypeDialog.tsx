import React from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';

import { RootModel } from '../../redux';
import { GraphicType } from '../../types';

interface Props extends DispatchProps {
  open: boolean;
  graphicType?: GraphicType;
  onClose(): void;
}

const DeleteGraphicTypeDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t('delete_graphic_type.header')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('delete_graphic_type.message')}{' '}
          <strong>{props.graphicType?.graphicTypeName}</strong>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>
          {t('delete_graphic_type.cancel')}
        </Button>
        <Button
          onClick={() => {
            props.onClose();
            props.deleteGraphicType(props.graphicType?.graphicTypeId);
          }}>
          {t('delete_graphic_type.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  deleteGraphicType: dispatch.graphicType.deleteGraphicType,
});

type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(() => ({}), mapDispatch)(DeleteGraphicTypeDialog);
