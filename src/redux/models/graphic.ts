import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Graphic } from '../../types/graphic';
import * as api from '../../services/api/graphic';
import logger from '../../utils/logger';

type GraphicState = {
  [key: string]: Graphic;
};

export const graphic = createModel<RootModel>()({
  state: {} as GraphicState,
  reducers: {
    onLoadGraphics(state, graphics: Graphic[]) {
      logger.info('Redux/Graphic/reducers/onLoadGraphics');
      logger.debug('Replacing current graphic with the new ones', {
        graphics: graphics.map((g) => g.graphicId),
      });
      const now = Date.now();
      return graphics.reduce((newState: GraphicState, graphic) => {
        graphic.key = graphic.graphicId + '#' + now.toString();
        newState[graphic.graphicId] = graphic;
        return newState;
      }, {});
    },
    onLoadGraphic(state, graphic: Graphic) {
      logger.info('Redux/Graphic/reducers/onLoadGraphic');
      const now = Date.now();
      graphic.key = graphic.graphicId + '#' + now.toString();
      logger.debug('Replacing the loaded graphic', {
        graphic: graphic.graphicId,
        key: graphic.key,
      });
      return { ...state, [graphic.graphicId]: graphic };
    },
    onCreateGraphic(state, graphic: Graphic) {
      logger.info('Redux/Graphic/reducers/onCreateGraphic');
      const now = Date.now();
      graphic.key = graphic.graphicId + '#' + now.toString();
      logger.debug('Adding the new graphic', {
        graphic: graphic.graphicId,
        key: graphic.key,
      });
      return {
        ...state,
        [graphic.graphicId]: graphic,
      };
    },
    onUpdateGraphic(state, { graphicId, body }: Graphic) {
      logger.info('Redux/Graphic/reducers/onUpdateGraphic');
      const now = Date.now();
      const key = graphicId + '#' + now.toString();
      logger.debug('Key has been generated', { graphic: graphicId, key, body });
      return {
        ...state,
        [graphicId]: {
          ...state[graphicId],
          ...body,
          key,
        },
      };
    },
    onDeleteGraphic(state, graphicId: string) {
      logger.info('Redux/Graphic/reducers/onDeleteGraphic');
      const newState = { ...state };
      delete newState[graphicId];
      return newState;
    },
    'Auth/onLogout': function () {
      logger.debug('Clearing Graphics State');
      return {};
    },
  },
  effects: (dispatch) => ({
    async getGraphics(graphicTypeId: string) {
      logger.info('Redux/Graphic/effects/getGraphics');
      logger.debug('Getting graphics', {
        graphicType: graphicTypeId,
      });
      const packs = await api.getGraphics(graphicTypeId);
      logger.debug('Updating redux state');
      dispatch.graphic.onLoadGraphics(packs);
    },
    async getGraphic(graphicId: string) {
      logger.info('Redux/Graphic/effects/getGraphic');
      logger.debug('Getting graphic', {
        graphic: graphicId,
      });
      const graphic = await api.getGraphic(graphicId);
      dispatch.graphic.onLoadGraphic(graphic[0]);
    },
    async updateGraphic({ graphicId, body }: Graphic, state: GraphicState) {
      const backup = { ...state[graphicId] }.body;
      logger.info('Redux/Graphic/effects/updateGraphic');
      try {
        logger.debug('Updating graphic', { graphic: graphicId, body });
        await api.updateGraphic(graphicId, body);
        dispatch.graphic.onUpdateGraphic({ graphicId, body });
      } catch (e) {
        dispatch.graphic.onUpdateGraphic({ graphicId, body: backup });
        logger.debug('Error updating graphic', { graphicId });
        console.error('Error updating graphic:', e?.message || e);
        throw e;
      }
    },
    async deleteGraphic(graphicId: string) {
      logger.info('Redux/Graphic/effects/deleteGraphic');
      logger.debug('Deleting graphic', { graphic: graphicId });
      await api.deleteGraphic(graphicId);
      dispatch.graphic.onDeleteGraphic(graphicId);
    },
    async createGraphic(graphicId: string) {
      try {
        const graphic = await api.createGraphic({ graphicId });
        return graphic;
      } catch (e) {
        console.error({
          message: 'Error adding Graphic',
          isError: e,
        });
      }
    },
    async duplicateGraphicVersion({
      source: { fromDefault, data },
      newGraphicId,
      newGraphicName,
    }: {
      source: { fromDefault: any; data: any };
      newGraphicId: string;
      newGraphicName: string;
    }) {
      logger.info('Redux/Graphic/effects/duplicateGraphicVersion');
      logger.debug('Creating new graphic by duplication', {
        graphic: {
          id: newGraphicId,
          name: newGraphicName,
        },
      });
      if (fromDefault) {
        logger.debug('Duplicating graphic from default');
        const newGraphic = {
          graphicId: newGraphicId,
          graphicName: newGraphicName,
          ...data,
        };
        logger.debug('Creating new graphic from default data', {
          graphic: newGraphic,
        });
        await api.createGraphic(newGraphic);
        dispatch.graphic.onCreateGraphic(newGraphic);
      } else {
        logger.debug('Duplicating existing version');
        await api.duplicateGraphicVersion(data, newGraphicId, newGraphicName);
        const graphic = await api.getGraphic(newGraphicId);
        dispatch.graphic.onLoadGraphic(graphic[0]);
      }
    },
  }),
  selectors: (slice, createSelector) => ({
    allGraphics() {
      return slice((state) => Object.values(state));
    },
    graphicById() {
      return createSelector(
        slice,
        (state: GraphicState, id: string) => id,
        (state: GraphicState, id: string) => state[id]
      );
    },
  }),
});
