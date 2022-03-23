import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';

import { RootModel, RootState, store } from '../../redux';
import BackTitle from './BackTitle';

interface Props {
  graphicId: string;
  graphicTypeId: string;
}

const mapState = (state: RootState, { graphicId, graphicTypeId }: Props) => ({
  graphic: store.select.graphic.graphicById(state, graphicId),
  graphicTypeId,
  user: state.auth,
  showAs: state.app.showAs,
  showGraphicTypeSettings: true,
});

const mapDispatch = (
  dispatch: RematchDispatch<RootModel>,
  { graphicId }: Props
) => ({
  onRename: (name: string) => {
    dispatch.graphic.updateGraphic({ graphicId, body: { graphicName: name } });
  },
});

export default connect(mapState, mapDispatch)(BackTitle);
