import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { KeyboardDatePicker } from '@material-ui/pickers';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Moment from 'moment';
import { useTranslation } from 'react-i18next';

import imgDefaultThumbnail from '../../assets/default_thumbnail.png';
import { RootState, store, RootModel } from '../../redux';
import { Graphic, GraphicType } from '../../types';
import logger from '../../utils/logger';
import {
  useAdminCheck,
  useEditorCheck,
  useTesterCheck,
} from '../../hooks/use-role-check';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';
import Title from '../../components/Title';
import Button from '../../components/Button';
import Switch from '../../components/Switch';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    flexBasis: 300,
    margin: 10,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  media: {
    width: '100%',
    height: 'auto',
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  action: {
    border: '1px solid #fafafa',
    borderRadius: 4,
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(0.5),
  },
  actionText: {
    fontSize: 12,
  },
  actionButton: {
    fontSize: 12,
    textTransform: 'none',
  },
  textarea: {
    padding: 16,
    marginBottom: theme.spacing(2),
    border: '1px solid #F0F0F0',
    borderRadius: 4,
    fontSize: 14,
    width: '100%',
  },
  onlineLinkButton: {
    border: '1px solid #ffe5cb',
    backgroundColor: '#ffffff',
    textTransform: 'none',
    height: 47,
  },
  testLinkButton: {
    border: '1px solid #bfe8ff',
    backgroundColor: '#ffffff',
    textTransform: 'none',
  },
  visibilityIn: {
    fontSize: 14,
    fontWeight: 400,
  },
  copyorange: {
    color: '#ffe5cb',
  },
  textfield: {
    marginBottom: '15px',
  },
  linkContainer: {
    backgroundColor: '#eee',
    display: 'flex',
    '& button': {
      flexShrink: 0,
      borderRight: 'solid 1px rgba(0, 0, 0, 0.12)',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& pre': {
      margin: 0,
      padding: [[theme.spacing(2), theme.spacing(1)]],
      flexGrow: 1,
      flexShrink: 1,
      overflowX: 'scroll',
    },
  },
  readOnlyDetails: {
    margin: '10px 0',
    display: 'flex',
    flexWrap: 'wrap',
    '& label': {
      fontSize: 16,
      width: '100%',
    },
  },
}));

interface OptionsProps extends OptionsStateProps, OptionsDispatchProps {
  graphic: Graphic;
}

const Options: React.FC<OptionsProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const isAdmin = useAdminCheck(props.user, props.showAs);
  const isEditor = useEditorCheck(props.user, props.showAs);
  const { graphic } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [deletable, setDeletable] = useState(graphic.deletable);
  const [isLocked, setLocked] = useState(graphic.isLocked);
  const [editor, setEditor] = useState(graphic.editorVisible);
  const [viewer, setViewer] = useState(graphic.viewerVisible);
  const [title, setTitle] = useState(graphic.graphicBrowserTitle || '');
  const [eof, setEOF] = useState(graphic.endOfSupport);
  const [manualDataDate, setManualDataDate] = useState(graphic.manualDataDate);
  const [updFrqMnth, setUpdFrqMnth] = useState(graphic.updateFrequencyInMonth);

  const [description, setDescription] = useState(
    graphic.graphicBrowserDescription || ''
  );
  const [notes, setNotes] = useState(graphic.notes || '');

  const handleTextChange = (
    set: React.Dispatch<React.SetStateAction<string>>
  ) => {
    return (e: any) => set(e.target.value as string);
  };

  const handleSave = () => {
    logger.info('Dashboard/Details/Form/Save-Handler');
    logger.debug('Editting Access and General Info for the graphic', {
      graphic: graphic.graphicId,
    });
    props
      .updateGraphic({
        graphicId: graphic.graphicId,
        body: {
          editorVisible: editor,
          viewerVisible: viewer,
          deletable,
          isLocked,
          graphicBrowserTitle: title ? title : undefined,
          graphicBrowserDescription: description ? description : undefined,
          notes: notes ? notes : undefined,
          endOfSupport: eof,
          manualDataDate: manualDataDate,
          updateFrequencyInMonth: updFrqMnth,
        },
      })
      .then(() => {
        enqueueSnackbar('Graphic updated', {
          variant: 'success',
        });
      })
      .catch((err: Error) => {
        logger.error('Error updating graphic', { err });
        enqueueSnackbar('Error updating graphic', {
          variant: 'error',
        });
      });
  };

  return (
    <>
      {isAdmin ? (
        <Switch
          label={t('graphic_settings.visible_to_editor')}
          checked={editor}
          onChange={(e) => setEditor(e.target.checked)}
          disabled={isLocked}
        />
      ) : null}
      <Switch
        label={t('graphic_settings.visible_to_viewer')}
        checked={viewer}
        onChange={(e) => setViewer(e.target.checked)}
        disabled={isLocked}
      />
      <Switch
        label={t('graphic_version_details.modifications_restricted')}
        checked={isLocked}
        onChange={(e) => setLocked(e.target.checked)}
      />
      {isAdmin ? (
        <Switch
          label={t('graphic_version_details.can_be_deleted')}
          checked={deletable}
          onChange={(e) => setDeletable(e.target.checked)}
          disabled={isLocked}
        />
      ) : null}
      <TextField
        size="small"
        fullWidth
        className={classes.textfield}
        value={title}
        onChange={handleTextChange(setTitle)}
        color="secondary"
        variant="outlined"
        placeholder={t('graphic_version_details.graphic_browser_title')}
        disabled={isLocked}
      />
      <TextField
        size="small"
        fullWidth
        className={classes.textfield}
        value={description}
        onChange={handleTextChange(setDescription)}
        multiline
        rows="6"
        color="secondary"
        variant="outlined"
        placeholder={t('graphic_version_details.graphic_browser_description')}
        disabled={isLocked}
      />
      <TextField
        size="small"
        fullWidth
        className={classes.textfield}
        value={notes}
        onChange={handleTextChange(setNotes)}
        color="secondary"
        multiline
        rows="6"
        variant="outlined"
        placeholder={t('graphic_version_details.graphic_notes')}
        disabled={isLocked}
      />
      {isEditor ? (
        <KeyboardDatePicker
          className={classes.textfield}
          size="small"
          value={eof}
          onChange={(date) => setEOF(date?.toString())}
          label={t('graphic_version_details.end_of_support')}
          inputVariant="outlined"
          format="DD.MM.YYYY"
          KeyboardButtonProps={{
            'aria-label': 'change end of support date',
          }}
        />
      ) : null}
      {isEditor ? (
        <KeyboardDatePicker
          className={classes.textfield}
          size="small"
          value={manualDataDate}
          onChange={(date) => setManualDataDate(date?.toString())}
          label={t('graphic_version_details.data_last_updated')}
          inputVariant="outlined"
          format="DD.MM.YYYY"
          KeyboardButtonProps={{
            'aria-label': 'change manual data date',
          }}
        />
      ) : null}
      {isEditor ? (
        <TextField
          className={classes.textfield}
          size="small"
          value={updFrqMnth || ''}
          onChange={(e: any) => setUpdFrqMnth(Number(e.target.value))}
          label={t('graphic_version_details.update_frequency_in_months')}
          type="number"
        />
      ) : null}
      <Button
        disabled={props.updating}
        onClick={handleSave}
        fullWidth
        variant="outlined"
        color="secondary">
        {t('graphic_version_details.submit')}
      </Button>
    </>
  );
};

const optionsMapState = (state: RootState) => ({
  updating: state.loading.effects.graphic.updateGraphic,
  user: state.auth,
  showAs: state.app.showAs,
});

const optionsMapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  updateGraphic: dispatch.graphic.updateGraphic,
});

type OptionsStateProps = ReturnType<typeof optionsMapState>;
type OptionsDispatchProps = ReturnType<typeof optionsMapDispatch>;

const ConnectedOptions = connect(optionsMapState, optionsMapDispatch)(Options);

interface TutorialsProps extends TutorialsStateProps, TutorialsDispatchProps {
  graphic: Graphic;
}

const Tutorials: React.FC<TutorialsProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { graphic, loadAssets } = props;
  useEffect(() => {
    loadAssets(graphic.graphicId);
  }, [graphic, loadAssets]);

  return (
    <span className={classes.readOnlyDetails}>
      <label>{t('graphic_version_details.guides')}</label>
      {props.assets.map((a) => (
        <div key={a.assetId}>
          <a href={a.assetPath} target="_blank" rel="noopener noreferrer">
            {a?.assetFileName?.substring(1)}
          </a>
        </div>
      ))}
    </span>
  );
};

const tutorialsMapState = (state: RootState) => ({
  loading: state.loading.effects.assets.loadAssets,
  assets: store.select.assets.allGuides(state),
});

const tutorialsMapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  loadAssets: dispatch.assets.loadAssets,
});

type TutorialsStateProps = ReturnType<typeof tutorialsMapState>;
type TutorialsDispatchProps = ReturnType<typeof tutorialsMapDispatch>;

const ConnectedTutorials = connect(
  tutorialsMapState,
  tutorialsMapDispatch
)(Tutorials);

interface Props extends StateProps {
  graphicType: GraphicType;
  graphic?: Graphic;
  onPreview(graphic: Graphic): void;
}

const Details = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { graphic, showAs, user } = props;

  const hasAccess = useGraphicAccessCheck(user, showAs)(graphic);
  const isEditor = hasAccess && useEditorCheck(props.user, props.showAs);
  const isTester = useTesterCheck(props.user, props.showAs);

  return (
    <Paper className={classes.root}>
      <Title
        className={classes.title}
        title={props.graphicType.graphicTypeName || ''}
      />
      <img
        className={classes.media}
        src={
          props.graphicType.pathToThumbnail
            ? props.graphicType.pathToThumbnail
            : imgDefaultThumbnail
        }
        alt="Graphic Thumbnail"
      />
      {props.graphic?.graphicId ? (
        <Button
          onClick={() => {
            logger.debug('Dashboard/Details/Open-Preview', {
              user: props.user,
              graphicType: props.graphicType,
              graphic: props.graphic,
            });
            props.onPreview(props.graphic);
          }}
          style={{ marginBottom: 16 }}
          fullWidth
          variant="outlined"
          color="secondary">
          {t('graphic_version_details.preview')}
        </Button>
      ) : null}
      {isTester && props.graphic?.graphicId ? (
        <ConnectedTutorials graphic={props.graphic} />
      ) : null}
      {isEditor && props.graphic && props.graphic.graphicId ? (
        <ConnectedOptions graphicType={{}} graphic={props.graphic} />
      ) : null}
      {!isEditor && props.graphic?.graphicBrowserDescription ? (
        <span className={classes.readOnlyDetails}>
          <label>{t('graphic_version_details.browser_description')}</label>
          {props.graphic.graphicBrowserDescription}
        </span>
      ) : null}
      {!isEditor && props.graphic && props.graphic.endOfSupport ? (
        <span className={classes.readOnlyDetails}>
          <label>{t('graphic_version_details.end_of_support')}</label>
          {Moment(props.graphic.endOfSupport).format('DD.MM.YYYY')}
        </span>
      ) : null}
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(Details);
