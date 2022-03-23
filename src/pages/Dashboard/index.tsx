import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { RootModel, RootState, store } from '../../redux';
import { Graphic, GraphicType } from '../../types';
import logger from '../../utils/logger';
import { useSmallScreenCheck } from '../../hooks/use-small-screen-check';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';
import Drawer from '../../components/Drawer';
import Default from '../../components/Default';
import GraphicTypesList from './GraphicTypesList';
import GraphicsList from './GraphicsList';
import Details from './Details';
import PreviewDialog from './PreviewDialog';
import DeleteGraphicTypeDialog from './DeleteGraphicTypeDialog';

const drawerWidth = 391;

const useStyles = makeStyles({
  dashboard: {
    display: 'flex',
    flexGrow: 1,
    overflowX: 'hidden',
  },
  content: {
    alignItems: 'flex-start',
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    overflowY: 'scroll',
    padding: 10,
  },
});

interface Props extends StateProps, DispatchProps {
  history: any;
}

const Dashboard = (props: Props) => {
  const isSmallScreen = useSmallScreenCheck();

  const classes = useStyles({ small: isSmallScreen });
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const hasAccess = useGraphicAccessCheck(props.user, props.showAs);

  type Matches = { graphicTypeId?: string; graphicId?: string };
  const m1 = useRouteMatch<Matches>('/dashboard/:graphicTypeId/:g/:graphicId');
  const m2 = useRouteMatch<Matches>('/dashboard/:graphicTypeId/:graphicId');
  const m3 = useRouteMatch<Matches>('/dashboard/:graphicTypeId');
  const match = m1 || m2 || m3 || { params: {} as Matches };

  const { graphicTypeId: selectedGraphicTypeId, graphicId: selectedGraphicId } =
    match.params;

  const selectedGraphicType = props.graphicTypes.find(
    (gt) => gt.graphicTypeId === selectedGraphicTypeId
  );
  const selectedGraphic = props.graphicVersions.find(
    (gv) => gv.graphicId === selectedGraphicId
  );

  const { getGraphicTypes } = props;
  useEffect(() => {
    getGraphicTypes().catch((err) => {
      logger.error('Error getting graphic type', err);
      enqueueSnackbar('Error getting graphic type');
    });
  }, [getGraphicTypes, enqueueSnackbar]);

  const handleStar = ({ graphicTypeId, isFavorite }) => {
    props.updateGraphicType({
      graphicTypeId,
      body: {
        isFavorite: !isFavorite,
      },
    });
  };

  const [deleteDialogProps, setDeleteDialogProps] = useState({
    open: false,
    graphicType: null as GraphicType,
  });

  const [previewDialogProps, setPreviewDialogProps] = useState({
    open: false,
    graphicType: null as GraphicType,
    graphic: null as Graphic,
  });

  const showDeleteDialog = (graphicType: GraphicType) => {
    return setDeleteDialogProps({ open: true, graphicType });
  };

  const hideDeleteDialog = () => {
    return setDeleteDialogProps({ ...deleteDialogProps, open: false });
  };

  const showPreviewDialog = (graphicType: GraphicType, graphic: Graphic) => {
    return setPreviewDialogProps({ open: true, graphicType, graphic });
  };

  const hidePreviewDialog = () => {
    return setPreviewDialogProps({ ...previewDialogProps, open: false });
  };

  return (
    <div className={classes.dashboard}>
      <Drawer width={drawerWidth}>
        <GraphicTypesList
          small={isSmallScreen}
          history={props.history}
          onSelect={(graphicTypeId) => {
            logger.info('Dashboard/Index/GraphicTypesList-onSelect-Handler');
            logger.debug('Updating graphic type selection state', {
              graphicType: graphicTypeId,
            });
            props.history.push(`/dashboard/${graphicTypeId}`, {
              fromIP3: true,
            });
          }}
          onStarred={handleStar}
          onDeleteGraphicType={showDeleteDialog}
          graphicTypes={props.graphicTypes.filter(hasAccess)}
          selectedId={selectedGraphicTypeId}
          loading={props.loadingGraphicTypes}
        />
      </Drawer>
      <main className={classes.content}>
        {selectedGraphicType && hasAccess(selectedGraphicType) ? (
          <>
            <GraphicsList
              small={isSmallScreen}
              onPreview={(graphic) => {
                logger.info('Dashboard/Index/GraphicsList-onPreview-Handler');
                showPreviewDialog(selectedGraphicType, graphic);
              }}
              onSelect={(graphicId) => {
                logger.info('Dashboard/Index/GraphicsList-onSelect-Handler');
                logger.debug('Updating graphic selection state', {
                  graphic: graphicId,
                });
                props.history.push(
                  `/dashboard/${selectedGraphicTypeId}/${graphicId}`,
                  { fromIP3: true }
                );
              }}
              onEdit={(graphicId) => {
                logger.info('Dashboard/Index/GraphicsList-onEdit-Handler');
                props.history.push(
                  `/edit/${selectedGraphicTypeId}/g/${graphicId}`,
                  { fromIP3: true }
                );
              }}
              graphicType={selectedGraphicType}
              selectedId={selectedGraphicId}
            />
            <Details
              key={selectedGraphicId || ''}
              graphicType={selectedGraphicType}
              graphic={selectedGraphic}
              onPreview={(graphic) => {
                logger.info('Dashboard/Index/Details-onPreview-Handler');
                showPreviewDialog(selectedGraphicType, graphic);
              }}
            />
          </>
        ) : (
          <Default
            header={t('dashboard.no_selection_header')}
            message={t('dashboard.no_selection_message')}
          />
        )}
      </main>
      <PreviewDialog
        open={previewDialogProps.open}
        onClose={() => {
          logger.info('Dashboard/Preview/onClose-Handler');
          hidePreviewDialog();
        }}
        graphic={previewDialogProps.graphic}
        graphicType={previewDialogProps.graphicType}
      />
      <DeleteGraphicTypeDialog
        open={deleteDialogProps.open}
        onClose={() => {
          logger.info('Dashboard/DeleteGraphicType/onClose-Handler');
          hideDeleteDialog();
        }}
        graphicType={deleteDialogProps.graphicType}
      />
    </div>
  );
};

const mapState = (state: RootState) => ({
  graphicTypes: store.select.graphicType.allGraphicTypes(state),
  graphicVersions: store.select.graphic.allGraphics(state),
  loadingGraphicTypes: state.loading.effects.graphicType.getGraphicTypes,
  showAs: state.app.showAs,
  user: state.auth,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  deleteGraphicType: dispatch.graphicType.deleteGraphicType,
  getGraphicTypes: dispatch.graphicType.getGraphicTypes,
  updateGraphicType: dispatch.graphicType.updateGraphicType,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Dashboard);
