import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { GraphicType } from '../../types/graphic-type';
import * as api from '../../services/api/graphic-type';
import logger from '../../utils/logger';

type GraphicTypeState = {
  [key: string]: GraphicType;
};

export const graphicType = createModel<RootModel>()({
  state: {} as GraphicTypeState,
  reducers: {
    onLoadGraphicTypes(state, graphicTypes: GraphicType[]) {
      logger.info('Redux/GraphicType/reducers/onLoadGraphicTypes');
      logger.debug('Replacing current graphic types with the new ones', {
        graphics: graphicTypes.map((gt) => gt.graphicTypeId),
      });
      return graphicTypes.reduce((newState: GraphicTypeState, graphicType) => {
        newState[graphicType.graphicTypeId] = graphicType;
        return newState;
      }, {});
    },
    onLoadGraphicType(state, graphicType: GraphicType) {
      if (!graphicType) {
        console.warn('onLoadGraphicType() received', graphicType);
        return state;
      }
      logger.info('Redux/GraphicType/reducers/onLoadGraphicType');
      logger.debug('Adding the new graphic type to the state', {
        graphic: graphicType.graphicTypeId,
      });
      return { ...state, [graphicType.graphicTypeId]: graphicType };
    },
    onCreateGraphicType(state, graphicType: GraphicType) {
      logger.info('Redux/GraphicType/reducers/onCreateGraphicType');
      logger.debug('Adding the new graphic type to the state', {
        graphic: graphicType.graphicTypeId,
      });
      return {
        ...state,
        [graphicType.graphicTypeId]: graphicType,
      };
    },
    onUpdateGraphicType(state, graphicType: GraphicType) {
      logger.info('Redux/GraphicType/reducers/onUpdateGraphicType');
      logger.debug('Updating the graphic type in the state', {
        graphic: graphicType.graphicTypeId,
        newData: graphicType.body,
      });
      return {
        ...state,
        [graphicType.graphicTypeId]: {
          ...state[graphicType.graphicTypeId],
          ...graphicType.body,
        },
      };
    },
    onDeleteGraphicType(state, graphicTypeId: string) {
      logger.info('Redux/GraphicType/reducers/onDeleteGraphicType');
      logger.debug('Deleting the graphic type in the state', {
        graphic: graphicTypeId,
      });
      const newState = { ...state };
      delete newState[graphicTypeId];
      return newState;
    },
    'Auth/onLogout': function () {
      logger.debug('Cleaning graphic type state');
      return {};
    },
  },
  effects: (dispatch) => ({
    async getGraphicTypes() {
      logger.info('Redux/GraphicType/effects/getGraphicTypes');
      logger.debug('Getting graphic types');
      const packs = await api.getGraphicTypes();
      logger.debug('Updating redux state');
      dispatch.graphicType.onLoadGraphicTypes(packs);
    },
    async getGraphicType(graphicTypeId: string) {
      try {
        const graphicType = await api.getGraphicType(graphicTypeId);
        dispatch.graphicType.onLoadGraphicType(graphicType[0]);
      } catch (e) {
        dispatch.toast.handleToggleToast({
          message: 'Error loading Graphic Types',
          error: e,
        });
      }
    },
    async deleteGraphicType(graphicTypeId: string) {
      try {
        const success = await api.deleteGraphicType(graphicTypeId);
        if (success) {
          dispatch.graphicType.onDeleteGraphicType(graphicTypeId);
          dispatch.toast.handleToggleToast({
            message: 'Successfully deleted Graphic Type',
          });
        }
      } catch (e) {
        dispatch.toast.handleToggleToast({
          message: 'Error deleting Graphic Types',
          error: e,
        });
      }
    },
    async updateGraphicType({ graphicTypeId, body }: GraphicType) {
      try {
        await api.updateGraphicType(graphicTypeId, body);
        dispatch.graphicType.onUpdateGraphicType({ graphicTypeId, body });
        dispatch.toast.handleToggleToast({
          message: 'Successfully updated Graphic Type',
        });
      } catch (e) {
        dispatch.toast.handleToggleToast({
          message: 'Error patching Graphic Type',
          error: e,
        });
      }
    },
    async saveGraphicType({ graphicTypeId, graphicTypeName }: GraphicType) {
      try {
        await api.saveGraphicType(
          graphicTypeId,
          graphicTypeName || graphicTypeId
        );
        dispatch.graphicType.onCreateGraphicType({
          graphicTypeId: graphicTypeId,
          graphicTypeName: graphicTypeName,
        });
        dispatch.toast.handleToggleToast({
          message: 'Successfully saved Graphic Type',
        });
      } catch (e) {
        dispatch.toast.handleToggleToast({
          message: 'Error saving Graphic Types',
          error: e,
        });
      }
    },
  }),
  selectors: (slice, createSelector) => ({
    allGraphicTypes() {
      return slice((state) => Object.values(state));
    },
    graphicTypeById() {
      return createSelector(
        slice,
        (state: GraphicTypeState, id: string) => id,
        (state: GraphicTypeState, id: string) => state[id]
      );
    },
  }),
});
