import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MButton from '@material-ui/core/Button';
import { useTranslation } from 'react-i18next';

import Switch from '../../components/Switch';
import Uploader from './Uploader';
import {
  useAdminCheck,
  useDeveloperCheck,
  useEditorCheck,
} from '../../hooks/use-role-check';
import { GraphicType } from '../../types';
import { RootModel, RootState } from '../../redux';
import { RematchDispatch } from '@rematch/core';

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(4),
    minHeight: 300,
    display: 'flex',
    alignItems: 'center',
  },
  firstCard: {
    padding: theme.spacing(4),
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing(5),
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'Rubik',
  },
  container: {
    width: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
  },
  uploadContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  previewContainer: {
    width: 300,
    display: 'flex',
    flexDirection: 'column',
  },
  previewHeader: {
    display: 'flex',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'Rubik',
    flexGrow: 1,
  },
  previewContent: {
    flexGrow: 1,
    padding: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 120,
  },
  videoContainer: {},
}));

interface Props extends StateProps, DispatchProps {
  graphicType: GraphicType;
}

const Setup: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const isAdmin = useAdminCheck(props.user, props.showAs);
  const isDeveloper = useDeveloperCheck(props.user, props.showAs);
  const isEditor = useEditorCheck(props.user, props.showAs);

  const { graphicType = {} as GraphicType, getGraphicType } = props;

  const [editor, setEditor] = useState(graphicType?.editorVisible);
  const [viewer, setViewer] = useState(graphicType?.viewerVisible);

  useEffect(() => {
    setEditor(graphicType.editorVisible);
    setViewer(graphicType.viewerVisible);
  }, [graphicType]);

  const handleSave = () => {
    props.updateGraphicType({
      graphicTypeId: graphicType.graphicTypeId,
      body: {
        editorVisible: editor,
        viewerVisible: viewer,
      },
    });
  };

  const [thumbnailKey, setThumbnailKey] = useState(new Date().valueOf());

  const handleSuccess = useCallback(() => {
    getGraphicType(graphicType.graphicTypeId);
  }, [graphicType, getGraphicType]);

  useEffect(() => {
    setThumbnailKey(new Date().valueOf());
  }, [graphicType]);

  if (!isEditor) return <div />;

  return props.graphicType && props.graphicType.graphicTypeId ? (
    <Fragment>
      {isAdmin ? (
        <Paper className={classes.firstCard}>
          <Switch
            key={`editor=${editor}`}
            label={t('graphic_settings.visible_to_editor')}
            checked={editor}
            onChange={(e) => setEditor(e.target.checked)}
          />
          <Switch
            key={`viewer=${viewer}`}
            label={t('graphic_settings.visible_to_viewer')}
            checked={viewer}
            onChange={(e) => setViewer(e.target.checked)}
          />
          <MButton
            disabled={props.updating}
            onClick={handleSave}
            color="secondary"
            variant="contained">
            {t('graphic_type_setup.save')}
          </MButton>
        </Paper>
      ) : null}
      <Paper className={classes.card}>
        <div className={classes.container}>
          <div className={classes.uploadContainer}>
            <Typography className={classes.title}>
              {t('graphic_type_setup.graphic_image')}
            </Typography>
            <Uploader
              confirmRequired={!!props.graphicType.pathToThumbnail}
              graphicType={props.graphicType}
              property="pathToThumbnail"
              onSuccess={handleSuccess}
            />
          </div>
          {props.graphicType.pathToThumbnail ? (
            <div className={classes.previewContainer}>
              <div className={classes.previewHeader}>
                <Typography className={classes.previewTitle}>
                  {t('graphic_type_setup.graphic_image_preview')}
                </Typography>
                <MButton>{t('graphic_type_setup.delete_image')}</MButton>
              </div>
              <div className={classes.previewContent}>
                <img
                  key={thumbnailKey}
                  alt="Graphic Thumbnail"
                  src={`${props.graphicType.pathToThumbnail}?v=${thumbnailKey}`}
                  className={classes.thumbnail}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Paper>
      {isDeveloper ? (
        <Paper className={classes.card}>
          <div className={classes.container}>
            <div className={classes.uploadContainer}>
              <Typography className={classes.title}>
                {t('graphic_type_setup.graphic_bundle')}
              </Typography>
              <Uploader
                confirmRequired={!!props.graphicType.pathToJS}
                graphicType={props.graphicType}
                property="pathToJS"
                onSuccess={handleSuccess}
              />
            </div>
            {props.graphicType.pathToJS ? (
              <div className={classes.previewContainer}>
                <div className={classes.previewHeader}>
                  <Typography className={classes.previewTitle}>
                    {t('graphic_type_setup.uploaded_graphic_bundle')}
                  </Typography>
                  <MButton>
                    {t('graphic_type_setup.delete_graphic_bundle')}
                  </MButton>
                </div>
                <div className={classes.previewContent}>
                  <Typography>bundle.js</Typography>
                </div>
              </div>
            ) : null}
          </div>
        </Paper>
      ) : null}
      <Paper className={classes.card}>
        <div className={classes.container + ' ' + classes.videoContainer}>
          <div className={classes.uploadContainer}>
            <Typography className={classes.title}>
              {t('graphic_type_setup.data_input_tutorial')}
            </Typography>
            <Uploader
              graphicType={props.graphicType}
              property="pathToDataTutorialVideo"
            />
          </div>
          {props.graphicType.pathToDataTutorialVideo ? (
            <div className={classes.previewContainer}>
              <div className={classes.previewHeader}>
                <Typography className={classes.previewTitle}>
                  {t('graphic_type_setup.data_tutorial_video')}
                </Typography>
                <MButton>
                  {t('graphic_type_setup.delete_data_tutorial_video')}
                </MButton>
              </div>
            </div>
          ) : null}
        </div>
      </Paper>
    </Fragment>
  ) : null;
};

// export default connect(
//   state => ({
//     updating: state.loading.effects.GraphicType.updateGraphicType,
//     user: state.Auth,
//     showAs: state.App.showAs,
//   }),
//   ({ GraphicType: { getGraphicType, updateGraphicType } }) => ({
//     getGraphicType,
//     updateGraphicType,
//   })
// )(Setup);

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
  updating: state.loading.effects.graphicType.updateGraphicType,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getGraphicType: dispatch.graphicType.getGraphicType,
  updateGraphicType: dispatch.graphicType.updateGraphicType,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Setup);
