import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useRouteMatch } from 'react-router-dom';

import { RootModel, RootState, store } from '../../redux/index';
import Defaults from './Defaults';
import CheckFunction from './CheckFunction';
import Setup from './Setup';
import { useEditorCheck } from '../../hooks/use-role-check';
import { RematchDispatch } from '@rematch/core';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    padding: 10,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflowX: 'hidden',
    overflowY: 'scroll',
    '& > *': {
      flexGrow: 1,
      flexBasis: '48%',
      overflow: 'hidden',
      margin: 10,
    },
  },
});

const GraphicTypeEditor: React.FC<StateProps & DispatchProps> = (props) => {
  const {
    params: { graphicTypeId },
    url,
  } = useRouteMatch<{ graphicTypeId: string }>();
  const classes = useStyles();
  const [tab, setTab] = useState('data');

  const { graphicType, showAs, user } = props;

  const hasAccess = useGraphicAccessCheck(user, showAs)(graphicType);
  const isEditor = hasAccess && useEditorCheck(user, showAs);

  const { getGraphicType } = props;
  useEffect(() => {
    getGraphicType(graphicTypeId);
  }, [getGraphicType, graphicTypeId]);

  if (!isEditor) return <div />;

  return (
    <div className={classes.root}>
      <Switch>
        <Route path={`${url}/setup`}>
          <Setup graphicType={props.graphicType} />
        </Route>
        <Route path={`${url}`}>
          <Route path={[`${url}/defaults`, url]} exact>
            <Defaults
              graphicType={props.graphicType}
              tab={tab}
              onChangeTab={setTab}
            />
          </Route>
          <Route path={`${url}/check-functions`}>
            <Defaults
              checkFunctionVisible
              graphicType={props.graphicType}
              tab={tab}
              onChangeTab={setTab}
            />
            <CheckFunction graphicType={props.graphicType} tab={tab} />
          </Route>
        </Route>
      </Switch>
    </div>
  );
};

const mapState = (
  state: RootState,
  {
    match: {
      params: { graphicTypeId },
    },
  }: RouteComponentProps<{ graphicTypeId: string }>
) => ({
  user: state.auth,
  showAs: state.app.showAs,
  graphicType: store.select.graphicType.graphicTypeById(state, graphicTypeId),
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getGraphicType: dispatch.graphicType.getGraphicType,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(GraphicTypeEditor);
