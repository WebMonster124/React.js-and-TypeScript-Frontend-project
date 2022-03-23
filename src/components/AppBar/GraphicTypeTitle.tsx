import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';

import { RootModel, RootState, store } from '../../redux';
import BackTitle from './BackTitle';

interface Props {
  graphicTypeId: string;
}

const mapState = (state: RootState, { graphicTypeId }: Props) => ({
  graphicType: store.select.graphicType.graphicTypeById(state, graphicTypeId),
  user: state.auth,
  showAs: state.app.showAs,
});

const mapDispatch = (
  dispatch: RematchDispatch<RootModel>,
  { graphicTypeId }: Props
) => ({
  onRename: (name: string) => {
    dispatch.graphicType.updateGraphicType({
      graphicTypeId,
      body: { graphicTypeName: name },
    });
  },
});

export default connect(mapState, mapDispatch)(BackTitle);
