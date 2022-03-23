import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import {
  Switch,
  Route,
  useRouteMatch,
  RouteComponentProps,
} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import { RootModel, RootState, store } from '../../redux/index';
import { API as PreviewAPI } from '../../components/Preview';
import logger from '../../utils/logger';
import { useEditorCheck, useTesterCheck } from '../../hooks/use-role-check';
import Assets from './Assets';
import GraphicEditorMenu from './GraphicEditorMenu';
import Editor from './GraphicEditor';
import PreviewPane from './PreviewPane';
import PublishButton from './PublishButton';
import Drawer from '../../components/Drawer';
import VisualConfig from '../../components/VisualConfig';
import { Graphic } from '../../types';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';

const drawerWidth = 250;

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    overflowX: 'hidden',
  },
  content: {
    flexGrow: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
  },
  loading: {
    textAlign: 'center',
    margin: 50,
  },
});

const GraphicEditor = (props: StateProps & DispatchProps) => {
  const {
    params: { graphicId, graphicTypeId },
    url,
  } = useRouteMatch<{ graphicId: string; graphicTypeId: string }>();
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { graphic, showAs, user } = props;

  const hasAccess = useGraphicAccessCheck(user, showAs)(graphic);
  const isEditor = hasAccess && useEditorCheck(user, showAs);
  const isTester = useTesterCheck(user, showAs);

  const { getGraphic, getGraphicType, users, getUsers } = props;
  useEffect(() => {
    getGraphic(graphicId).catch((err) => {
      logger.error('Error getting graphic', { err });
      enqueueSnackbar('Error getting graphic');
    });
    getGraphicType(graphicTypeId).catch((err) => {
      logger.error('Error getting graphic type', { err });
      enqueueSnackbar('Error getting graphic type');
    });
  }, [getGraphic, graphicId, getGraphicType, graphicTypeId, enqueueSnackbar]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const {
    css0Test,
    css0Online,
    dataTest,
    dataOnline,
    descriptorsTest,
    descriptorsOnline,
  } = graphic || ({} as Graphic);

  const testPreviewRef = useRef<PreviewAPI>();
  const onlinePreviewRef = useRef<PreviewAPI>();
  useEffect(() => {
    if (testPreviewRef.current) testPreviewRef.current.reload();
  }, [css0Test, dataTest, descriptorsTest]);
  useEffect(() => {
    if (onlinePreviewRef.current) onlinePreviewRef.current.reload();
  }, [css0Online, dataOnline, descriptorsOnline]);

  if (!isTester) return <div />;

  const access = props.user.editorAccess;
  const restricted = access?.length > 0;
  const dataAccess = !restricted || access.includes('data');
  const notesAccess = !restricted || access.includes('notes');
  const descriptorsAccess = !restricted || access.includes('descriptors');
  const cssAccess = !restricted || access.includes('css');
  const assetsAccess = !restricted || access.includes('assets');
  const configAccess = !restricted || access.includes('config');
  const configVisualAccess = configAccess || access.includes('configVisual');
  const configEditorAccess = configAccess || access.includes('configEditor');

  return (
    <div className={classes.root}>
      <Drawer width={drawerWidth}>
        {props.graphic ? <GraphicEditorMenu editorAccess={access} /> : null}
      </Drawer>
      <main className={classes.content}>
        <Switch>
          <Route exact path={`${url}/config-visual`}>
            {props.graphic && props.graphic?.graphicId && configVisualAccess ? (
              <VisualConfig
                graphic={graphic}
                configDefault={props.graphicType?.configDefault}
                showHiddenFields={true}
              />
            ) : null}
          </Route>
          <Route exact path={`${url}/assets`}>
            {assetsAccess ? <Assets graphic={graphic} /> : null}
          </Route>
          <Route
            path={`${url}/:screen?`}
            render={({ match: { params, url: key } }) => {
              const screen = params.screen || 'data';
              if (screen === 'data' && !dataAccess) return;
              if (screen === 'note' && !notesAccess) return;
              if (screen === 'css-v0' && !cssAccess) return;
              if (screen === 'descriptors' && !descriptorsAccess) return;
              if (screen === 'config-editor' && !configEditorAccess) return;
              if (screen === 'config-visual') return;
              if (screen === 'assets') return;
              return (
                <>
                  {graphic && graphic.graphicId ? (
                    <Editor
                      graphicType={props.graphicType}
                      graphic={graphic}
                      key={key}
                    />
                  ) : null}
                  <Route
                    exact
                    path={[
                      `${url}/`,
                      `${url}/data`,
                      `${url}/css-v0`,
                      `${url}/descriptors`,
                    ]}>
                    {graphic?.graphicId ? (
                      <>
                        <PreviewPane
                          ref={testPreviewRef}
                          graphic={graphic}
                          title={t('graphic_version_editor.test_version')}
                          wrapperId="test-preview-frame"
                          configDefault={props.graphicType?.configDefault}
                          screen={screen}
                          users={users}
                          test={true}
                        />
                        {isEditor ? (
                          <PublishButton
                            graphic={graphic}
                            graphicType={props.graphicType}
                          />
                        ) : null}
                        <PreviewPane
                          ref={onlinePreviewRef}
                          graphic={graphic}
                          title={t('graphic_version_editor.online_version')}
                          wrapperId="online-preview-frame"
                          configDefault={props.graphicType?.configDefault}
                          screen={screen}
                          users={users}
                        />
                      </>
                    ) : null}
                  </Route>
                </>
              );
            }}
          />
        </Switch>
      </main>
    </div>
  );
};

const mapState = (
  state: RootState,
  {
    match: {
      params: { graphicId, graphicTypeId },
    },
  }: RouteComponentProps<{ graphicTypeId: string; graphicId: string }>
) => ({
  user: state.auth,
  showAs: state.app.showAs,
  loading: state.loading.effects.graphic.getGraphic,
  updating: state.loading.effects.graphic.updateGraphic,
  graphic: store.select.graphic.graphicById(state, graphicId),
  graphicType: store.select.graphicType.graphicTypeById(state, graphicTypeId),
  users: store.select.user.allUsers(state),
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getGraphic: dispatch.graphic.getGraphic,
  updateGraphic: dispatch.graphic.updateGraphic,
  getGraphicType: dispatch.graphicType.getGraphicType,
  getUsers: dispatch.user.getUsers,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(GraphicEditor);
