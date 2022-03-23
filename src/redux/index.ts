import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import LoadingPlugin, { ExtraModelsFromLoading } from '@rematch/loading';
import SelectPlugin from '@rematch/select';
import { models, RootModel } from './models';

type FullModel = ExtraModelsFromLoading<RootModel>;

export const store = init<RootModel, FullModel>({
  models,
  plugins: [LoadingPlugin(), SelectPlugin()],
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
export type { RootModel } from './models';
