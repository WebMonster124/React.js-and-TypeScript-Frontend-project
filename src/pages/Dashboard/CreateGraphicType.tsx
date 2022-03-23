import React from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useTranslation } from 'react-i18next';

import GraphicParamsPrompt from './GraphicParamsPrompt';
import { RootModel } from '../../redux/models';

interface Props extends DispatchProps {
  open: boolean;
  requestClose(): void;
}

const CreateGraphicType: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const handleCreateGraphicType = (id: string, name: string) => {
    props.saveGraphicType({
      graphicTypeId: id,
      graphicTypeName: name,
    });
    props.requestClose();
  };

  return (
    <GraphicParamsPrompt
      open={props.open}
      name={''}
      id={''}
      onSubmit={handleCreateGraphicType}
      onClose={props.requestClose}
      header={t('create_graphic_type.header')}
      nameHint={t('create_graphic_type.graphic_type_name')}
      idHint={t('create_graphic_type.graphic_type_id')}
      submitLabel={t('create_graphic_type.submit')}
    />
  );
};

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  saveGraphicType: dispatch.graphicType.saveGraphicType,
});

type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(() => ({}), mapDispatch)(CreateGraphicType);
