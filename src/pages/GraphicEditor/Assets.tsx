import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { red, yellow } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import CopyToClipboard from 'react-copy-to-clipboard';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import HelpOutline from '@material-ui/icons/HelpOutline';
import SearchIcon from '@material-ui/icons/Search';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import MuiButton from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import SvgIcon from '@material-ui/core/SvgIcon';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Mime from 'mime/lite';
import Moment from 'moment';
import Fuse from 'fuse.js';
import { useTranslation } from 'react-i18next';

import { Graphic } from '../../types';
import logger from '../../utils/logger';
import { RootModel, RootState, store } from '../../redux';
import { useEditorCheck } from '../../hooks/use-role-check';
import Button from '../../components/Button';
import NewAssets from './NewAssets';

const filesize = (bytes = 0) => {
  const suf = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  if (bytes === 0) return '0' + suf[0];
  const place = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  const num = Math.round(bytes / Math.pow(1024, place));
  return `${num}${suf[place]}`;
};

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 10,
    padding: 40,
  },
  header: {
    display: 'flex',
  },
  actions: {},
  title: {
    fontSize: 22,
    fontFamily: 'Playfair Display',
    fontWeight: 400,
    flexGrow: 1,
  },
  addNewButton: {
    width: 176,
    height: 44,
  },
  searchform: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 14,
    border: '1px solid #f0f0f0',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  img: {
    height: '50px',
    width: 'auto',
  },
  filename: {
    fontWeight: 600,
  },
  assetActions: {
    textAlign: 'right',
  },
  margin: {},
  listroot: {},
}));

const FileCopyIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 11 14">
    <path
      fill="#ffd037"
      d="M11.616 2.364c.306 0 .554.264.554.59v9.455c0 .326-.248.591-.554.591h-8.85c-.306 0-.553-.265-.553-.59v-1.774H.553c-.305 0-.553-.264-.553-.59V.59C0 .265.248 0 .553 0h8.85c.306 0 .554.265.554.59v1.774zm-10.51 7.09h7.745V1.183H1.106zm9.957-5.909H9.957v6.5c0 .327-.248.591-.553.591H3.319v1.182h7.744z"
    />
  </SvgIcon>
);

interface AlertProps {
  open: boolean;
  filename: string;
  onOk?(): void;
}

interface Props extends StateProps, DispatchProps {
  graphic: Graphic;
}

const Assets = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const isEditor = useEditorCheck(props.user, props.showAs);

  const [open, setOpen] = useState(false);
  const [alertProps, setAlertProps] = useState<AlertProps>({
    open: false,
    filename: '',
  });

  const handleAlertClose = () => {
    logger.debug('Closing alert dialog');
    setAlertProps({
      open: false,
      filename: '',
    });
  };

  const handleDelete = (asset) => {
    logger.info('GraphicEditor/Assets/Delete-Handler');
    logger.debug('Opening delete alert');
    setAlertProps({
      open: true,
      filename: asset.assetFileName,
      onOk: () => {
        logger.info('GraphicEditor/DeleteAsset/Ok-Handler');
        logger.debug('Deleting asset', {
          graphic: graphic.graphicId,
          filename: asset.assetFileName,
        });
        props
          .deleteAsset({
            graphicId: graphic.graphicId,
            filename: asset.assetFileName,
          })
          .then(() => {
            logger.debug('Asset deleted', {
              graphic: graphic.graphicId,
              filename: asset.assetFileName,
            });
            enqueueSnackbar('Asset deleted', {
              variant: 'success',
            });
          })
          .catch((err) => {
            logger.debug('Error deleting asset', {
              graphic: graphic.graphicId,
              filename: asset.assetFileName,
              err,
            });
            enqueueSnackbar('Error deleting asset', {
              variant: 'error',
            });
          });
      },
    });
  };

  const { graphic, loadAssets } = props;

  useEffect(() => {
    if (graphic && graphic.graphicId)
      loadAssets(graphic.graphicId).catch((e) => {
        logger.error('Error loading assets', { err: e });
        enqueueSnackbar('Error loading assets', {
          variant: 'error',
        });
      });
  }, [graphic, loadAssets, enqueueSnackbar]);

  const searchIndex = useRef(null);
  const [assets, setAssets] = useState(props.assets);
  const [query, setQuery] = useState('');
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    searchIndex.current = new Fuse(props.assets, {
      keys: ['assetFileName'],
    });
  }, [props.assets]);

  useEffect(() => {
    if (searchIndex.current && query) {
      const result = searchIndex.current.search(query);
      setAssets(result.map((el) => el.item));
    } else setAssets(props.assets || []);
  }, [query, props.assets]);

  const handleUploadClose = useCallback(() => {
    logger.debug('Closing new asset dialog');
    setOpen(false);
  }, []);

  return (
    <Paper className={classes.root}>
      <NewAssets
        open={open}
        graphic={props.graphic}
        requestClose={handleUploadClose}
      />
      <div className={classes.header}>
        <Typography variant="h3" className={classes.title}>
          {t('assets_list.title')}
        </Typography>
        <div>
          {isEditor ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                logger.info('GraphicEditor/Assets/NewAsset-Handler');
                logger.debug('Opening dialog');
                setOpen(true);
              }}
              className={classes.addNewButton}
              startIcon={<AddIcon />}>
              {t('assets_list.add')}
            </Button>
          ) : null}
          &nbsp;&nbsp;
          <IconButton aria-label="help" className={classes.margin}>
            <HelpOutline fontSize="large" />
          </IconButton>
        </div>
      </div>
      <br />
      <div className={classes.searchform}>
        <IconButton className={classes.iconButton} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          value={query}
          onChange={handleSearch}
          fullWidth
          className={classes.input}
          placeholder={t('assets_list.search')}
        />
      </div>
      <br />
      <br />
      <Table className={classes.listroot}>
        <TableBody>
          {assets.map((asset) => {
            const defaultMime = 'application/octet-stream';
            const mime = Mime.getType(asset.assetFileName) || defaultMime;
            return (
              <TableRow key={asset.assetId}>
                <TableCell>
                  {mime.startsWith('image') ? (
                    <img
                      className={classes.img}
                      alt={mime}
                      src={asset.assetPath}
                    />
                  ) : null}
                </TableCell>
                <TableCell>
                  <Typography
                    gutterBottom
                    variant="subtitle1"
                    className={classes.filename}>
                    {asset.assetFileName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {filesize(asset.assetSize)}
                    <br />
                    {Moment(asset.uploadedOn).format('DD.MM.YYYY')}
                  </Typography>
                </TableCell>
                {isEditor ? (
                  <TableCell>
                    <div className={classes.assetActions}>
                      <CopyToClipboard
                        text={`{assetsUrl}/${asset.assetFileName}`}
                        onCopy={() =>
                          enqueueSnackbar('Link copied to clipboard')
                        }>
                        <IconButton aria-label="copy">
                          <FileCopyIcon
                            style={{ fontSize: 20, color: yellow[500] }}
                          />
                        </IconButton>
                      </CopyToClipboard>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(asset)}>
                        <DeleteIcon style={{ fontSize: 20, color: red[500] }} />
                      </IconButton>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Dialog open={alertProps.open} onClose={handleAlertClose}>
        <DialogTitle>{t('assets_delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('assets_delete.message')} <strong>{alertProps.filename}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleAlertClose}>
            {t('assets_delete.cancel')}
          </MuiButton>
          <MuiButton
            onClick={() => {
              if (alertProps.onOk) alertProps.onOk();
              handleAlertClose();
            }}>
            {t('assets_delete.confirm')}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  loading: state.loading.effects.assets.loadAssets,
  assets: store.select.assets.allAssets(state),
  user: state.auth,
  showAs: state.app.showAs,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  loadAssets: dispatch.assets.loadAssets,
  deleteAsset: dispatch.assets.deleteAsset,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Assets);
