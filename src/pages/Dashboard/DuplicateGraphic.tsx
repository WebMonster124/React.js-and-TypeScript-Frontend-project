import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import logger from '../../utils/logger';
import { GraphicType } from '../../types/graphic-type';
import { Graphic } from '../../types/graphic';
import { RootState } from '../../redux';
import { RootModel } from '../../redux/models';
import GraphicParamsPrompt from './GraphicParamsPrompt';

interface Props extends StateProps, DispatchProps {
  graphicType: GraphicType;
  open?: boolean;
  fromDefault?: boolean;
  version?: Graphic;
  requestClose(): void;
}

const DuplicateGraphic: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleDuplicate = (id: string, name: string) => {
    logger.info('Dashboard/DuplicateDialog/Add-Handler');
    const { fromDefault, graphicType, version } = props;
    const data = fromDefault
      ? {
          graphicTypeId: graphicType.graphicTypeId,
          css0Test: graphicType.cssDefault,
          configOnline: graphicType.configDefault, // There's only one config version
          descriptorsTest: graphicType.descriptorsDefault,
          dataTest: graphicType.dataDefault,
        }
      : version?.graphicId;
    logger.debug('Data constructed', { data });
    logger.debug('Starting duplication');
    props
      .duplicateGraphicVersion({
        source: {
          fromDefault,
          data,
        },
        newGraphicId: id,
        newGraphicName: name,
      })
      .then(() => {
        enqueueSnackbar('Graphic duplicated successfully', {
          variant: 'success',
        });
      })
      .catch((err) => {
        logger.error('Error duplicating graphic', { err });
        enqueueSnackbar('Failed to duplicate the graphic', {
          variant: 'error',
        });
      })
      .finally(() => {
        setId('');
        setName('');
        props.requestClose();
      });
  };

  return (
    <GraphicParamsPrompt
      open={props.open || false}
      name={name}
      id={id}
      onSubmit={handleDuplicate}
      onClose={props.requestClose}
      header={
        t('duplicate_graphic_version.header') +
        ' ' +
        (props.fromDefault
          ? t('graphic_versions.default')
          : props.version?.graphicName)
      }
      nameHint={t('duplicate_graphic_version.graphic_version_name')}
      idHint={t('duplicate_graphic_version.graphic_version_id')}
      submitLabel={t('duplicate_graphic_version.submit')}
    />
  );
};

const mapState = (state: RootState) => ({
  duplicating: state.loading.effects.graphic.duplicateGraphicVersion,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  duplicateGraphicVersion: dispatch.graphic.duplicateGraphicVersion,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(DuplicateGraphic);
