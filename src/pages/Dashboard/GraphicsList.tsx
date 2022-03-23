import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import Fuse from 'fuse.js';
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { blue, yellow, red, grey } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import IconButton from '@material-ui/core/IconButton';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import PreviewIcon from '@material-ui/icons/Visibility';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import logger from '../../utils/logger';
import { useEditorCheck, useTesterCheck } from '../../hooks/use-role-check';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';
import { RootState, store } from '../../redux';
import { Graphic } from '../../types';
import Title from '../../components/Title';
import FavoriteIcon from '../../components/FavoriteIcon';
import Loader from '../../components/Loader';
import DuplicateGraphic from './DuplicateGraphic';
import { RootModel } from '../../redux/models';
import Switch from '../../components/Switch';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 3,
    flexBasis: 450,
    margin: 10,
    padding: 20,
    overflowX: 'hidden',
  },
  title: {
    marginBottom: 19,
    fontSize: 20,
    flexGrow: 1,
    fontFamily: '"Playfair Display", serif',
  },
  titleHeader: {
    width: '100%',
    display: 'flex',
    marginBottom: '33px',
  },
  searchform: {
    padding: '2px 4px',
    marginBottom: 14,
    border: '1px solid #f0f0f0',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  container: {
    height: '60px',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  actions: {
    display: 'flex',
  },
  wrappedActions: {
    flexWrap: 'wrap',
  },
  table: {
    display: 'block',
  },
  tbody: {
    display: 'block',
  },
  row: {
    display: 'block',
    maxWidth: '100%',
    overflowX: 'hidden',
    cursor: 'pointer',
  },
  metaCell: {
    overflowX: 'scroll',
    minWidth: 0,
  },
  rowEditor: {
    boxShadow: `inset -10px 0px 0px 0px ${theme.palette.secondary.main}`,
  },
  viewerMark: {
    display: 'inline-block',
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#7bd7a0',
    marginRight: 10,
  },
  toolbar: {
    display: 'flex',
  },
  showMeta: {
    width: 50,
    opacity: 0.3,
    marginBottom: 0,
  },
  dataLastUpdated: {
    fontSize: '0.9em',
    color: 'gray',
  },
  dataDateExceeded: {
    color: 'red',
    opacity: '0.5',
  },
  loader: {
    width: '100%',
    minHeight: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface Props extends StateProps, DispatchProps {
  graphicType: any;
  selectedId: string;
  small: boolean;
  onPreview(graphic: Graphic): void;
  onSelect(graphicId: string): void;
  onEdit(graphicId: string): void;
}

const sort = {
  viewerVisible(a: Graphic, b: Graphic) {
    if (!!a.viewerVisible === !!b.viewerVisible) {
      return this.favorite(a, b);
    }
    return a.viewerVisible ? -1 : 1;
  },
  favorite(a: Graphic, b: Graphic) {
    if (!!a.isFavorite === !!b.isFavorite) {
      return this.lastUpdated(a, b);
    }
    if (a.isFavorite) return -1;
    if (b.isFavorite) return 1;
    return 0;
  },
  lastUpdated(a: Graphic, b: Graphic) {
    const lastUpdatedA = moment(a.manualDataDate || a.dataOnlineLastUpdate);
    const lastUpdatedB = moment(b.manualDataDate || b.dataOnlineLastUpdate);
    if (lastUpdatedA.toString() === lastUpdatedB.toString()) {
      return this.graphicName(a, b);
    }
    if (!lastUpdatedA.isValid() && !lastUpdatedB.isValid()) return 0;
    if (lastUpdatedA.isValid() && !lastUpdatedB.isValid()) return 1;
    if (lastUpdatedB.isValid() && !lastUpdatedA.isValid()) return -1;
    return lastUpdatedB < lastUpdatedA ? -1 : 1;
  },
  graphicName(a: Graphic, b: Graphic) {
    return get(a, 'graphicName', '').localeCompare(get(b, 'graphicName', ''));
  },
};

const GraphicsList: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const hasAccess = useGraphicAccessCheck(props.user, props.showAs);
  const isEditor = useEditorCheck(props.user, props.showAs);
  const isTester = useTesterCheck(props.user, props.showAs);

  const { graphicType, getGraphics } = props;

  const [query, setQuery] = useState('');
  const [modalProps, setModalProps] = useState<{
    open?: boolean;
    fromDefault?: boolean;
    version?: Graphic;
  }>({ fromDefault: true });
  const [versions, setVersions] = useState(
    (props.graphicVersions || []).sort(sort.viewerVisible.bind(sort))
  );
  const [deleteDialogProps, setDeleteDialogProps] = useState({
    open: false,
    graphic: {} as Graphic,
  });
  const [showMeta, setShowMeta] = useState(
    !!window.sessionStorage.getItem('showMetaForVersion')
  );
  const searchIndex = useRef<Fuse<any> | null>(null);

  useEffect(() => {
    logger.info('Dashboard/Versions/loadingGraphics');
    getGraphics(graphicType.graphicTypeId).catch((err) => {
      logger.error('Error loading graphics', { err });
      enqueueSnackbar('Error loading graphics', {
        variant: 'error',
      });
    });
  }, [getGraphics, graphicType, enqueueSnackbar]);

  useEffect(() => {
    searchIndex.current = new Fuse(props.graphicVersions, {
      keys: ['graphicName'],
    });
  }, [props.graphicVersions]);

  useEffect(() => {
    if (searchIndex.current && query) {
      const result = searchIndex.current.search(query);
      setVersions(result.map((el) => el.item));
    } else
      setVersions(
        (props.graphicVersions || []).sort(sort.viewerVisible.bind(sort))
      );
  }, [query, props.graphicVersions]);

  const handleSearch = (e: any) => {
    setQuery(e.target.value);
  };

  const handleStar = (version: Graphic) => {
    logger.info('Dashboard/Versions/Star-Handler');
    logger.debug('Toggling the isFavorite property', {
      graphic: version.graphicId,
      to: !version.isFavorite,
    });
    props
      .updateGraphic({
        graphicId: version.graphicId,
        body: { isFavorite: !version.isFavorite },
      })
      .then(() => {
        enqueueSnackbar(`${version.graphicName} is now a favorite`, {
          variant: 'success',
        });
      })
      .catch((err) => {
        logger.error('Failed to toggle the favorite status', { err });
        enqueueSnackbar(`Error making ${version.graphicName} a favorite`, {
          variant: 'error',
        });
      });
  };

  const handleDuplicate = (fromDefault: boolean, version?: Graphic) => {
    logger.info('Dashboard/Versions/DuplicateHandler');
    logger.debug('Opening Duplicate Dialog', {
      fromDefault,
      graphic: version?.graphicId,
    });
    setModalProps({
      open: true,
      fromDefault,
      version,
    });
  };

  const handleClose = () => {
    logger.debug('Closing Delete Dialog');
    setDeleteDialogProps({
      open: false,
      graphic: {} as Graphic,
    });
  };

  const handleGraphicDelete = (graphic: Graphic) => {
    logger.info('Dashboard/Versions/Delete-Handler');
    logger.debug('Opening Delete Dialog', {
      graphic: graphic?.graphicId,
    });
    setDeleteDialogProps({
      open: true,
      graphic,
    });
  };

  const renderMeta = (version: Graphic) => {
    let meta = '';
    if (version.dataOnline) {
      const data = JSON.stringify(version.dataOnline.meta, null, 2);
      meta = (data || '')
        .replace(/[{}]|,(?=\n)/g, '')
        .split('\n')
        .map((s) => s.replace(/^\s{1, 2}/, '').replace(/\s*$/, ''))
        .map((s) => s.split('"').join(''))
        .filter((s) => !!s)
        .join('\n');
      // TODO resolve the \" that can happens in json file
    }
    return meta;
  };

  return (
    <Paper className={classes.root}>
      <DuplicateGraphic
        requestClose={() => setModalProps({ fromDefault: true })}
        graphicType={props.graphicType}
        {...modalProps}
      />
      <Dialog open={deleteDialogProps.open} onClose={handleClose}>
        <DialogTitle>{t('delete_graphic_version.header')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('delete_graphic_version.message')}{' '}
            <strong>{deleteDialogProps.graphic.graphicName}</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            {t('delete_graphic_version.cancel')}
          </Button>
          <Button
            onClick={() => {
              logger.info('Dashboard/Versions/DeleteDialog/Ok-Handler');
              handleClose();
              logger.debug('Deleting graphic', {
                graphic: deleteDialogProps?.graphic?.graphicId,
              });
              props
                .deleteGraphic(deleteDialogProps.graphic.graphicId)
                .then(() => {
                  enqueueSnackbar('Graphic has been deleted', {
                    variant: 'success',
                  });
                })
                .catch((err) => {
                  logger.error('Failed to delete the favorite status', { err });
                  enqueueSnackbar(`Error deleting the graphic`, {
                    variant: 'error',
                  });
                });
            }}>
            {t('delete_graphic_version.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <Title className={classes.title} title={t('graphic_versions.header')} />
      <div className={classes.searchform}>
        <IconButton className={classes.iconButton} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          fullWidth
          onChange={handleSearch}
          className={classes.input}
          placeholder={t('graphic_versions.search')}
          inputProps={{ 'aria-label': 'Search graphic version' }}
        />
      </div>
      {isTester ? (
        <div className={classes.toolbar}>
          <Switch
            label={<InfoOutlinedIcon style={{ verticalAlign: 'middle' }} />}
            className={classes.showMeta}
            checked={showMeta}
            onChange={(e) => {
              const { checked } = e.target;
              if (checked)
                window.sessionStorage.setItem('showMetaForVersion', 'true');
              else window.sessionStorage.removeItem('showMetaForVersion');
              setShowMeta(checked);
            }}
          />
        </div>
      ) : null}
      {props.loadingGraphic ? (
        <div className={classes.loader}>
          <Loader size={40} />
        </div>
      ) : (
        <TableContainer>
          <Table className={classes.table}>
            <TableBody className={classes.table}>
              {isEditor ? (
                <TableRow className={classes.row}>
                  <TableCell>
                    <div className={classes.actions}>
                      <IconButton
                        aria-label="copy"
                        onClick={() => handleDuplicate(true)}>
                        <FileCopy
                          style={{ fontSize: 18, color: yellow[500] }}
                        />
                      </IconButton>
                    </div>
                  </TableCell>
                  <TableCell style={{ width: '100%' }}>
                    {t('graphic_versions.default')}
                  </TableCell>
                  {showMeta ? <TableCell /> : null}
                  <TableCell />
                </TableRow>
              ) : null}
              {versions.filter(hasAccess).map((version) => {
                const selected = props.selectedId === version.graphicId;
                return (
                  <TableRow
                    key={version.key}
                    selected={selected}
                    className={
                      classes.row +
                      (version.editorVisible && isTester
                        ? ' ' + classes.rowEditor
                        : '')
                    }
                    onClick={() => {
                      logger.info('Dashboard/Versions/Select-Graphic');
                      logger.debug('Clicked on graphic', {
                        graphic: version.graphicId,
                      });
                      props.onSelect(version.graphicId);
                    }}>
                    {isTester ? (
                      <>
                        <TableCell style={{ width: 150 }}>
                          <div
                            className={
                              classes.actions +
                              (showMeta ? ' ' + classes.wrappedActions : '')
                            }>
                            {isEditor ? (
                              <>
                                <IconButton
                                  aria-label="favorite"
                                  onClick={() => handleStar(version)}>
                                  <FavoriteIcon
                                    isFavorite={version.isFavorite}
                                  />
                                </IconButton>
                                <IconButton
                                  aria-label="copy"
                                  onClick={() =>
                                    handleDuplicate(false, version)
                                  }>
                                  <FileCopy
                                    style={{
                                      fontSize: 18,
                                      color: yellow[500],
                                    }}
                                  />
                                </IconButton>
                              </>
                            ) : null}
                            <IconButton
                              aria-label="edit"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                if (typeof props.onEdit === 'function')
                                  props.onEdit(version.graphicId);
                              }}>
                              <EditIcon
                                style={{ fontSize: 18, color: blue[500] }}
                              />
                            </IconButton>
                            {isEditor ? (
                              <IconButton
                                aria-label="delete"
                                onClick={() => handleGraphicDelete(version)}
                                disabled={!version.deletable}>
                                <DeleteIcon
                                  style={{
                                    fontSize: 18,
                                    color: version.deletable
                                      ? red[500]
                                      : grey[300],
                                  }}
                                />
                              </IconButton>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell style={{ width: '100%' }}>
                          <div>
                            {version.graphicBrowserTitle || version.graphicName}
                          </div>
                          {(() => {
                            const date = moment(
                              version.manualDataDate ||
                                version.dataOnlineLastUpdate
                            );
                            const deadline = moment().subtract(
                              30 * (version.updateFrequencyInMonth || 0),
                              'days'
                            );
                            const exceeded =
                              (version.updateFrequencyInMonth || 0) > 0 &&
                              date.toDate() < deadline.toDate();
                            if (date && date.isValid())
                              return (
                                <div
                                  className={[classes.dataLastUpdated]
                                    .concat(
                                      exceeded ? classes.dataDateExceeded : ''
                                    )
                                    .join(' ')}>
                                  {date.fromNow()}
                                </div>
                              );
                          })()}
                        </TableCell>
                        {showMeta && isTester ? (
                          <TableCell className={classes.metaCell}>
                            <pre style={{ minWidth: 0 }}>
                              {renderMeta(version)}
                            </pre>
                          </TableCell>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className={classes.actions}>
                            <IconButton
                              aria-label="preview"
                              onClick={() => props?.onPreview(version)}>
                              <PreviewIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                        <TableCell style={{ width: '100%' }}>
                          {version.graphicBrowserTitle || version.graphicName}
                        </TableCell>
                      </>
                    )}
                    {props.small ? null : version.viewerVisible && isTester ? (
                      <TableCell align="right">
                        <span className={classes.viewerMark}></span>
                      </TableCell>
                    ) : (
                      <TableCell align="right" />
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  loadingGraphic: state.loading.effects.graphic.getGraphics,
  graphicVersions: store.select.graphic.allGraphics(state),
  user: state.auth,
  showAs: state.app.showAs,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  deleteGraphic: dispatch.graphic.deleteGraphic,
  getGraphics: dispatch.graphic.getGraphics,
  updateGraphic: dispatch.graphic.updateGraphic,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(GraphicsList);
