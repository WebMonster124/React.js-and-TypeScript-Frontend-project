import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useRouteMatch } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { red, blue } from '@material-ui/core/colors';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import GetAppIcon from '@material-ui/icons/GetApp';
import MButton from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/Delete';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import JSONEditor from '../../components/JSONEditor';
import { RootModel, RootState } from '../../redux';
import { AuthUser, Graphic, GraphicBody, GraphicType } from '../../types';
import {
  saveFunction,
  runFunction,
  scheduleFunction,
} from '../../services/api/node-function';
import { useDeveloperCheck, useEditorCheck } from '../../hooks/use-role-check';
import logger from '../../utils/logger';
import Editor, { CodeEditor } from '../../components/Editor';
import Button from '../../components/Button';
import {
  getCodeFromGraphic,
  getBodyFromCode,
  getCodeKey,
  getLastSavedByKey,
  getLastUpdateKey,
} from '../../utils/mapper';
import HelpVideoDialog from './HelpVideoDialog';
import TabPanel from './TabPanel';
import DataFunctionSettingsDialog from './DataFunctionSettingsDialog';
import PullFromAPI from './PullFromApi';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';

const useStyles = makeStyles({
  root: {
    margin: 10,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  tabBar: {
    margin: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabs: {},
  scheduler: {
    display: 'flex',
  },
  schedulerInput: {
    width: 50,
    textAlign: 'center',
    border: 'none',
    borderBottom: '1px solid black',
  },
  schedulerSelect: {
    border: 'none',
  },
  tabPanels: {
    margin: 10,
    marginTop: 0,
  },
  jsonEditorWrapper: {
    height: 500,
    display: 'flex',
    flexDirection: 'column',
  },
  jsonEditorAction: {
    fontSize: '1rem',
    background: 'transparent',
    border: 'none',
    margin: 0,
  },
  editorSearchQuery: {
    border: 'none',
    borderBottom: '1px solid gray',
    padding: 8,
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  jsonEditorContainer: {
    flexGrow: 1,
    overflowY: 'scroll',
  },
  actions: {
    display: 'flex',
    margin: 10,
  },
  action: {
    flexGrow: 1,
    padding: '0 8px',
    '&:first-child': {
      paddingLeft: 0,
    },
    '&:last-child': {
      paddingRight: 0,
    },
  },
});

const parseHelpVideos = (notes: string) => {
  if (typeof notes !== 'string') return {};
  return {
    data: notes?.match(/data:::(.*)/)?.[1],
    descriptors: notes?.match(/descriptors:::(.*)/)?.[1],
    'css-v0': notes?.match(/css:::(.*)/)?.[1],
  };
};

const optionsForScreen = (
  screen: string,
  props: { graphic: Graphic; graphicType: GraphicType }
) => {
  let value = '';
  let language = 'json' as 'text' | 'css' | 'json';
  const isBase = screen.substr(0, 5) === 'base-';
  if (isBase) {
    screen = screen.slice(5);
    value = getCodeFromGraphic(props.graphicType, screen, 'default');
  } else {
    value = getCodeFromGraphic(props.graphic, screen);
  }
  if (screen === 'note') language = 'text';
  if (screen === 'css-v0') language = 'css';
  if (screen === 'data') language = 'json';
  if (screen === 'descriptors') language = 'json';
  if (screen === 'config-editor') language = 'json';
  return { value, language };
};

interface ButtonProps {
  id: string;
  props: { [key: string]: any };
  name?: string;
  w?: number;
}

interface UseButtonsForScreenProps {
  functionHasChanges: boolean;
  graphic: Graphic;
  hasChanges: boolean;
  helpVideos: { [key: string]: string };
  showAs: string;
  updating: boolean;
  user: AuthUser;
}

const useButtonsForScreen = (
  screen: string,
  tab: string,
  { helpVideos, updating, hasChanges, ...props }: UseButtonsForScreenProps
): ButtonProps[] => {
  const { t } = useTranslation();
  const isEditor = useEditorCheck(props.user, props.showAs);
  if ((screen === 'note' && tab === 'custom') || screen === 'config-editor') {
    if (screen === 'config-editor' && !isEditor) return [];
    return [
      {
        id: 'save',
        w: 35,
        name: updating ? 'Updating...' : t('graphic_version_editor.save'),
        props: {
          disabled: !hasChanges || updating,
        },
      },
    ];
  }

  if (tab === 'custom' || tab === 'json-editor') {
    return [
      {
        id: 'save',
        name: updating ? 'Updating...' : null,
        props: {
          disabled: !hasChanges || updating,
        },
      },
      {
        id: 'pull',
        props: {
          disabled: updating,
        },
      },
      {
        id: 'help',
        props: { disabled: !helpVideos[screen] },
      },
    ];
  }

  if (tab === 'function-editor') {
    return [
      {
        id: 'saveFunction',
        name: updating ? 'Updating...' : null,
        props: {
          disabled: !props.functionHasChanges,
        },
      },
      {
        id: 'runFunction',
        props: {
          disabled: props.functionHasChanges || !props.graphic?.dataCode,
        },
      },
      {
        id: 'help',
        props: { disabled: !helpVideos[screen] },
      },
    ];
  }

  return [];
};

const safeParseJSON = (object: any, cb?: (e: any, v?: any) => any): any => {
  try {
    const data = JSON.parse(object);
    if (cb) cb(null, data);
    return data;
  } catch (e) {
    if (cb) cb(e);
  }
};

const useActions = () => {
  const { t } = useTranslation();
  return {
    save: {
      name: t('graphic_version_editor.save_test_version'),
      props: {
        color: 'secondary',
        variant: 'contained',
        startIcon: <SaveIcon />,
      },
      handler: 'onSave',
      disabledKey: 'updating',
    },
    pull: {
      name: t('graphic_version_editor.pull_online_version'),
      props: {
        color: 'primary',
        variant: 'contained',
        startIcon: <GetAppIcon />,
      },
      handler: 'onPull',
    },
    saveFunction: {
      name: t('graphic_version_editor.save_function'),
      props: {
        color: 'secondary',
        variant: 'contained',
        startIcon: <SaveIcon />,
      },
      handler: 'onSaveFunction',
      disabledKey: 'updating',
    },
    runFunction: {
      name: t('graphic_version_editor.execute_funtion'),
      props: {
        color: 'primary',
        variant: 'contained',
        startIcon: <KeyboardArrowRightIcon />,
      },
      handler: 'onRunFunction',
    },
    help: {
      name: t('graphic_version_editor.help'),
      props: {
        color: 'secondary',
        variant: 'outlined',
        startIcon: <PlayCircleOutlineIcon />,
      },
      handler: 'onHelp',
    },
  };
};

const jsonEditorProps = {
  nameForItemInList: () => '–',
  typeBackgrounds: {
    string: 'green',
    number: 'tomato',
    boolean: 'orange',
  },
  typeColors: {
    string: 'white',
    number: 'white',
    object: 'gray',
    array: 'gray',
  },
};

interface Props extends StateProps, DispatchProps {
  graphic: Graphic;
  graphicType: GraphicType;
}

const GraphicEditor = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { graphic, showAs, user } = props;

  const hasAccess = useGraphicAccessCheck(user, showAs)(graphic);
  const isDeveloper = useDeveloperCheck(user, showAs);
  const isEditor = hasAccess && useEditorCheck(user, showAs);

  const actions = useActions();

  const {
    params: { screen = 'data' },
  } = useRouteMatch<{ screen?: string }>();
  const availableBaseScreens = [
    'data',
    'descriptors',
    'config-editor',
    'css-v0',
  ];

  const [helpVideos] = useState(parseHelpVideos(graphic?.notes));

  const [showHelpVideoDialog, setShowHelpVideoDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('custom');

  // Custom Editor
  const ceOptions = optionsForScreen(screen, props);
  const [ceValue, setCeValue] = useState(ceOptions.value);
  const ceLang = ceOptions.language;
  const hasChanges = ceValue !== ceOptions.value;

  // Base Editor
  const beAvailable = availableBaseScreens.includes(screen);
  const beOptions = optionsForScreen('base-' + screen, props);
  const beValue = beOptions.value;
  const beLang = beOptions.language;

  // JS Editor
  const [functionValue, setFunctionValue] = useState(graphic?.dataCode);
  const [fnEditorSettingsOpen, setFnEditorSettingsOpen] = useState(false);
  const [fnEditorDestination, setFnEditorDestination] = useState('dataTest');
  const [fnEditorInterval, setFnEditorInterval] = useState(1440);

  const functionEditorHasChanges = () => {
    if (graphic.dataCode !== functionValue) return true;
    if (graphic.result_destition !== fnEditorDestination) return true;
    if (graphic.exec_interval !== fnEditorInterval) return true;
    return false;
  };

  useEffect(() => {
    const { dataCode, result_destition, exec_interval } = graphic;
    if (dataCode) setFunctionValue(dataCode);
    if (result_destition) setFnEditorDestination(result_destition);
    if (typeof exec_interval === 'number' && !isNaN(exec_interval))
      setFnEditorInterval(exec_interval);
  }, [graphic]);

  // Editor Buttons
  const editorButtons = useButtonsForScreen(screen, selectedTab, {
    ...props,
    helpVideos,
    hasChanges,
    functionHasChanges: functionEditorHasChanges(),
  });

  // JSON Editor
  const jeAvailable =
    (screen === 'data' || screen === 'descriptors') && ceValue.length < 100000;
  const [jeValue, setJeValue] = useState(jeAvailable && safeParseJSON(ceValue));
  const [jeSearchQuery, setJeSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(jeSearchQuery, 500);

  const jsonEditorOnChange = useCallback(
    (value) => {
      setJeValue(value);
      setCeValue(JSON.stringify(value, null, 2));
    },
    [setJeValue, setCeValue]
  );

  const [rootName, setRootName] = useState<string>(
    t('graphic_version_editor.data')
  );
  useEffect(() => {
    setRootName(t('graphic_version_editor.' + screen));
  }, [screen, t]);

  const renderJsonEditorButton = useCallback(
    ({ type, disabled, onClick }) => (
      <button
        tabIndex={-1}
        disabled={disabled}
        onClick={onClick}
        className={classes.jsonEditorAction}>
        {type === 'delete' ? (
          <DeleteIcon
            fontSize="small"
            style={{
              color: disabled ? 'transparent' : red[500],
              cursor: disabled ? 'default' : 'pointer',
            }}
          />
        ) : (
          <FileCopyIcon
            fontSize="small"
            style={{
              color: disabled ? 'transparent' : blue[500],
              cursor: disabled ? 'default' : 'pointer',
            }}
          />
        )}
      </button>
    ),
    [classes]
  );

  useEffect(() => {
    if (selectedTab === 'editor') {
      const data = safeParseJSON(ceValue);
      if (data) setJeValue(data);
    }
  }, [selectedTab, ceValue]);

  const refreshGraphic = async () => {
    try {
      await props.getGraphic(graphic.graphicId);
    } catch (e) {
      logger.error('Error while refrshing graphic', {
        graphic: graphic.graphicId,
        err: e,
      });
      enqueueSnackbar('Error refreshing', { variant: 'error' });
      console.error(e.message);
    }
  };

  const scheduleDataFunction = async (interval: number) => {
    try {
      await scheduleFunction(graphic.graphicId, interval);
      logger.debug('Function scheduled');
      enqueueSnackbar('Function scheduled', { variant: 'success' });
    } catch (e) {
      logger.error('Error while scheduling function', {
        graphic: graphic.graphicId,
        err: e,
      });
      enqueueSnackbar('Error scheduling', { variant: 'error' });
      console.error(e.message);
    }
  };

  const actionsHandlers = {
    onSave: async () => {
      logger.info('GraphicEditor/Editor/SaveHandler');
      logger.debug('Saving graphic', {
        screen,
        graphic: graphic.graphicId,
      });
      try {
        const key = getCodeKey(screen);
        let body = { [key]: {} } as GraphicBody;
        if (selectedTab === 'editor') {
          body = { [key]: jeValue };
        } else {
          body = getBodyFromCode(ceValue, screen);
        }
        body[getLastSavedByKey(screen)] = user.username;
        body[getLastUpdateKey(screen)] = Date.now();
        await props.updateGraphic({ graphicId: graphic.graphicId, body });
        await props.getGraphic(graphic.graphicId);
        logger.debug('Graphic was updated');
        setJeValue(body[key]);
        enqueueSnackbar('Changes saved', { variant: 'success' });
        refreshGraphic();
      } catch (e) {
        logger.error('Error while updating graphic', {
          graphic: graphic.graphicId,
          err: e,
        });
        enqueueSnackbar('Error saving', { variant: 'error' });
        console.error(e.message);
      }
    },
    onPull: () => {
      logger.info('GraphicEditor/Editor/PullHandler');
      logger.debug('Opening Dialog');
      setAlertProps({
        open: true,
        title: 'Reset the Editor to Online Version',
        text: 'This will replace the current content of the editor with the current version from online',
        onOk: () => {
          logger.debug('Copying the online version to the editor', {
            graphic: graphic.graphicId,
          });
          const code = getCodeFromGraphic(graphic, screen, 'online');
          setCeValue(code);
        },
      });
    },
    onSaveFunction: async () => {
      logger.info('GraphicEditor/Editor/SaveFunctionHandler');
      logger.debug('Saving function', {
        screen,
        graphic: graphic.graphicId,
      });
      try {
        await saveFunction(
          graphic.graphicId,
          functionValue,
          fnEditorDestination
        );
        logger.debug('Function saved');
        enqueueSnackbar('Function saved', { variant: 'success' });
        await scheduleDataFunction(fnEditorInterval);
        refreshGraphic();
      } catch (e) {
        logger.error('Error while saving function', {
          graphic: graphic.graphicId,
          err: e,
        });
        enqueueSnackbar('Error saving', { variant: 'error' });
        console.error(e.message);
      }
    },
    onRunFunction: async () => {
      try {
        const result = await runFunction(graphic.graphicId);
        setCeValue(JSON.stringify(result.data, null, '  '));
        setSelectedTab('custom');
        logger.debug('Function executed');
        enqueueSnackbar('Function executed', { variant: 'success' });
        refreshGraphic();
      } catch (e) {
        logger.error('Error while running function', {
          graphic: graphic.graphicId,
          err: e,
        });
        enqueueSnackbar('Error running', { variant: 'error' });
        console.error(e.message);
      }
      await props.getGraphic(graphic.graphicId);
    },
    onHelp: () => {
      logger.info('GraphicEditor/Editor/HelpHandler');
      logger.debug('Opening Dialog');
      setShowHelpVideoDialog(true);
    },
  };

  const [alertProps, setAlertProps] = useState({
    open: false,
    title: '',
    text: '',
    onOk: null,
  });

  const closeAlert = () => {
    logger.info('GraphicEditor/Editor/AlertCancel-Handler');
    setAlertProps({
      open: false,
      title: '',
      text: '',
      onOk: null,
    });
  };

  const onEditorMount = (editor: CodeEditor) => {
    if (screen === 'descriptors') editor?.getAction('editor.foldLevel2')?.run();
  };

  const localePrefix = 'graphic_version_editor';
  const localeCustomTab = `${localePrefix}.custom_${screen.replace(/-.*/, '')}`;
  const localeBaseTab = `${localePrefix}.base_${screen.replace(/-.*/, '')}`;
  const localeNoteTab = `${localePrefix}.note`;
  const localeNotePreviewTab = `${localePrefix}.note_preview`;
  const localeVisualEditorTab = `${localePrefix}.visual_editor`;
  const localeDataFunctionTab = `${localePrefix}.data_function`;

  const access = user.editorAccess;
  const restricted = access?.length > 0;
  const dataFunctionAccess = !restricted || access.includes('dataFunction');

  return (
    <>
      {isEditor && screen === 'data' ? (
        <PullFromAPI
          graphic={graphic}
          onPull={(data) => setCeValue(JSON.stringify(data, null, 2))}
        />
      ) : null}
      <Paper className={classes.root}>
        <div className={classes.tabBar}>
          <Tabs
            className={classes.tabs}
            value={selectedTab}
            onChange={(_, val) => setSelectedTab(val)}>
            <Tab
              label={t(screen === 'note' ? localeNoteTab : localeCustomTab)}
              value="custom"
            />
            {screen === 'note' && (
              <Tab label={t(localeNotePreviewTab)} value="note-preview" />
            )}
            {beAvailable && <Tab label={t(localeBaseTab)} value="base" />}
            {jeAvailable && (
              <Tab label={t(localeVisualEditorTab)} value="json-editor" />
            )}
            {isDeveloper && screen === 'data' && dataFunctionAccess && (
              <Tab label={t(localeDataFunctionTab)} value="function-editor" />
            )}
          </Tabs>
          {selectedTab === 'function-editor' && dataFunctionAccess ? (
            <IconButton
              color="secondary"
              onClick={() => setFnEditorSettingsOpen(true)}>
              <MoreHorizIcon />
            </IconButton>
          ) : null}
        </div>
        <div className={classes.tabPanels}>
          <TabPanel selectedTab={selectedTab} value="custom" keepChildren>
            <Editor
              language={ceLang}
              value={ceValue}
              key={screen}
              editorDidMount={onEditorMount}
              onChange={setCeValue}
            />
          </TabPanel>
          {screen === 'note' && (
            <TabPanel
              selectedTab={selectedTab}
              value="note-preview"
              keepChildren>
              <Markdown remarkPlugins={[gfm]}>{ceValue}</Markdown>
            </TabPanel>
          )}
          {beAvailable && (
            <TabPanel selectedTab={selectedTab} value="base" keepChildren>
              <Editor
                language={beLang}
                value={beValue}
                key={screen}
                editorDidMount={onEditorMount}
                options={{ readOnly: true }}
              />
            </TabPanel>
          )}
          {jeAvailable && (
            <TabPanel selectedTab={selectedTab} value="json-editor">
              <div className={classes.jsonEditorWrapper}>
                <input
                  className={classes.editorSearchQuery}
                  placeholder={t('visual_json_editor.filter')}
                  type="text"
                  value={jeSearchQuery}
                  onChange={(ev) => setJeSearchQuery(ev.target.value)}
                />
                <div className={classes.jsonEditorContainer}>
                  <JSONEditor
                    {...jsonEditorProps}
                    value={jeValue}
                    query={debouncedSearchQuery}
                    hiddenKeys={
                      graphic.configOnline?.visualEditorHiddenKeys
                        ?.value as string[]
                    }
                    lockedKeys={
                      graphic.configOnline?.visualEditorLockedKeys
                        ?.value as string[]
                    }
                    onChange={jsonEditorOnChange}
                    rootName={rootName}
                    renderButton={renderJsonEditorButton}
                  />
                </div>
              </div>
            </TabPanel>
          )}
          {isDeveloper && screen === 'data' && (
            <TabPanel
              selectedTab={selectedTab}
              value="function-editor"
              keepChildren>
              <Editor
                language="javascript"
                value={functionValue}
                onChange={setFunctionValue}
              />
            </TabPanel>
          )}
        </div>
        {editorButtons.length > 0 ? (
          <div className={classes.actions}>
            {editorButtons?.map((button) => (
              <div className={classes.action} key={button.id}>
                <Button
                  fullWidth
                  onClick={actionsHandlers[actions[button.id]?.handler]}
                  {...actions[button.id]?.props}
                  {...button.props}>
                  {button.name || actions[button.id]?.name}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <Dialog open={alertProps.open} onClose={closeAlert}>
          <DialogTitle>{alertProps.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{alertProps.text}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <MButton onClick={closeAlert}>Cancel</MButton>
            <MButton
              onClick={() => {
                logger.info('GraphicEditor/Editor/AlertOk-Handler');
                if (alertProps.onOk) alertProps.onOk();
                closeAlert();
              }}>
              Ok
            </MButton>
          </DialogActions>
        </Dialog>
        <HelpVideoDialog
          videoUrl={helpVideos[screen]}
          open={showHelpVideoDialog}
          onClose={() => setShowHelpVideoDialog(false)}
        />
        <DataFunctionSettingsDialog
          open={fnEditorSettingsOpen}
          interval={fnEditorInterval}
          destination={fnEditorDestination as any}
          onSubmit={({ destination, minutes }) => {
            setFnEditorDestination(destination);
            setFnEditorInterval(minutes);
          }}
          onClose={() => {
            setFnEditorSettingsOpen(false);
          }}
        />
      </Paper>
    </>
  );
};

const mapState = (state: RootState) => ({
  updating: state.loading.effects.graphic.updateGraphic,
  showAs: state.app.showAs,
  user: state.auth,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getGraphic: dispatch.graphic.getGraphic,
  updateGraphic: dispatch.graphic.updateGraphic,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(GraphicEditor);
