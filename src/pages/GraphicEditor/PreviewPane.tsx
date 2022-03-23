import React, {
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DownloadIcon from '@material-ui/icons/GetApp';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import RefreshIcon from '@material-ui/icons/Refresh';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import { parse, stringify } from 'query-string';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';

import { User } from '../../types';
import { RootState } from '../../redux';
import { getAssets } from '../../services/api';
import {
  getLastUpdateText,
  getOnlineLastUpdateText,
} from '../../utils/last-saved';
import { createGraphicBundleUrl } from '../../utils/url';
import { configToQuery, mergeConfig } from '../../utils/config';
import { createGraphicPreviewHtml } from '../../utils/preview-html';
import VisualConfig from '../../components/VisualConfig';
import EmbedLinks from '../../components/EmbedLinks';
import Preview, {
  API as PreviewAPI,
  Props as PreviewProps,
} from '../../components/Preview';

export const useStyles = makeStyles({
  root: {
    margin: 10,
  },
  header: {
    height: 70,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    padding: '0 20px',
  },
  dialogDownloading: {
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    marginRight: 6,
  },
  lastSavedBy: {
    color: 'gray',
    marginTop: 5,
    marginRight: 'auto',
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
  content: {
    padding: 20,
  },
  dialog: {
    padding: 20,
  },
});

interface Props extends PreviewProps, StateProps {
  title: string;
  screen: string;
  users: User[];
  test?: boolean;
}

const PreviewWrapper = forwardRef((props: Props, ref) => {
  console.log('PreviewWrapper:', props);

  const classes = useStyles();
  const { t } = useTranslation();

  const { configDefault, graphic, screen, test, users } = props;
  const { configOnline } = graphic;

  const [previewQuery, setPreviewQuery] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const preview = useRef<PreviewAPI>(null);

  useEffect(() => {
    setPreviewQuery(configToQuery(mergeConfig(configDefault, configOnline)));
  }, [configDefault, configOnline]);

  const handleConfigChange = useCallback(
    (config) => {
      if (typeof config === 'object') {
        const queryString = configToQuery(mergeConfig(configDefault, config));
        if (queryString !== previewQuery) {
          setPreviewQuery(queryString);
        }
      }
    },
    [previewQuery, configDefault]
  );

  const query = props.test
    ? stringify({
        ...parse(previewQuery),
        data: 'test',
        descriptors: 'test',
        css0: 'test',
      })
    : previewQuery;

  const reload = useCallback(() => {
    if (preview.current) preview.current.reload();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      reload,
    }),
    [reload]
  );

  const fetchFile = async (name: string, url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return { name, blob };
  };

  const fetchAssets = async () => {
    const assets = await getAssets(props.graphic.graphicId);
    const results = await Promise.allSettled(
      assets.map((f) => fetchFile(f.assetFileName, f.assetPath))
    );
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    return fulfilled.map((f) => (f as any).value);
  };

  const downloadGraphic = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      console.log('Loading bundle.js...');
      const bundleUrl = createGraphicBundleUrl(props.graphic.graphicTypeId);
      const bundleRes = await fetch(bundleUrl);
      const bundleText = await bundleRes.text();
      zip.file('bundle.js', bundleText);
      console.log('Loading assets...');
      const assets = await fetchAssets();
      assets.forEach((f) => zip.file('assets/' + f.name, f.blob));
      console.log('Preparing Payload...');
      const g = props.graphic;
      const title = g.graphicName;
      const style = props.test ? g.css0Test : g.css0Online;
      const paylod = JSON.stringify({
        data: props.test ? g.dataTest : g.dataOnline,
        descriptors: props.test ? g.descriptorsTest : g.descriptorsOnline,
        config: g.configOnline,
      });
      const indexHtml = createGraphicPreviewHtml(title, style, paylod);
      zip.file('index.html', indexHtml);
      console.log('Generating ZIP...');
      const base64 = await zip.generateAsync({ type: 'base64' });
      setDownloadVisible(false);
      (window.location as any) = 'data:application/zip;base64,' + base64;
    } catch (error) {
      console.error(error.message);
    }
    setDownloading(false);
  };

  const getLastUpdated = test ? getLastUpdateText : getOnlineLastUpdateText;
  const lastSavedText = getLastUpdated(graphic, screen, users);

  return (
    <Paper className={classes.root}>
      <Dialog
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        maxWidth="md"
        fullWidth>
        <DialogContent className={classes.dialog}>
          <VisualConfig
            graphic={props.graphic}
            handleChange={handleConfigChange}
            disabledSave={true}
            config={configOnline}
            configDefault={configDefault}
            configQuery={previewQuery}
          />
          <EmbedLinks
            graphicId={props.graphic && props.graphic.graphicId}
            query={previewQuery}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={downloadVisible}
        onClose={() => !downloading && setDownloadVisible(false)}>
        <DialogTitle>{t('static_download.header')}</DialogTitle>
        <DialogContent className={downloading ? classes.dialogDownloading : ''}>
          {downloading ? (
            <CircularProgress />
          ) : (
            <DialogContentText>
              {t('static_download.message')}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDownloadVisible(false)}
            disabled={downloading}>
            {t('static_download.cancel')}
          </Button>
          <Button onClick={() => downloadGraphic()} disabled={downloading}>
            {t('static_download.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <div className={classes.header}>
        <Typography
          color={props.test ? 'secondary' : 'primary'}
          component="h2"
          className={classes.title}>
          {props.title}
        </Typography>
        {lastSavedText ? (
          <Typography component="span" className={classes.lastSavedBy}>
            {lastSavedText}
          </Typography>
        ) : null}
        <div className={classes.toolbarButtons}>
          <IconButton
            color="secondary"
            onClick={() => setDownloadVisible(true)}>
            <DownloadIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => setSettingsVisible(true)}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="secondary" onClick={reload}>
            <RefreshIcon />
          </IconButton>
        </div>
      </div>
      <div className={classes.content}>
        <Preview
          wrapperId={props.wrapperId}
          ref={preview}
          graphic={props.graphic}
          query={query}
        />
      </div>
    </Paper>
  );
});

const mapState = (state: RootState) => ({
  user: state.auth,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState, null, null, { forwardRef: true })(
  PreviewWrapper
);
