import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Asset } from '../../types/assets';
import * as api from '../../services/api/assets';
import logger from '../../utils/logger';

type AssetsState = {
  [key: string]: Asset;
};

export const assets = createModel<RootModel>()({
  state: {} as AssetsState,
  reducers: {
    onLoadAssets(_, assets: any[]) {
      logger.info('Redux/Asset/reducers/onLoadAssets');
      logger.debug('Replacing all assets with the new ones', { assets });
      return assets.reduce((newState: AssetsState, asset) => {
        newState[asset.assetFileName] = asset;
        return newState;
      }, {});
    },
    onDeleteAsset(state, filename: string) {
      logger.info('Redux/Asset/reducers/onDeleteAsset');
      logger.debug('Removing asset from state', { asset: filename });
      const newState = { ...state };
      delete newState[filename];
      return newState;
    },
    'Auth/onLogout': function () {
      logger.debug('Clearing Assets State');
      return {};
    },
  },
  effects: (dispatch) => ({
    async loadAssets(graphicId: string) {
      logger.info('Redux/Asset/effects/loadAssets');
      logger.debug('Getting Assets', { graphic: graphicId });
      const assets = await api.getAssets(graphicId);
      dispatch.assets.onLoadAssets(assets);
    },
    async deleteAsset(args: { graphicId: string; filename: string }) {
      logger.debug('Deleting asset', {
        graphic: args.graphicId,
        asset: args.filename,
      });
      await api.deleteAsset(args.graphicId, args.filename);
      dispatch.assets.onDeleteAsset(args.filename);
    },
  }),
  selectors: (slice) => ({
    allAssets() {
      return slice((state) => Object.values(state));
    },
    allGuides() {
      return slice((state) =>
        Object.values(state).filter((a: any) =>
          a?.assetFileName?.startsWith('_')
        )
      );
    },
  }),
});
