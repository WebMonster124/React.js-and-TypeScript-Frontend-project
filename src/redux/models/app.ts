import { createModel } from '@rematch/core';
import { RootModel } from '.';

type AppState = {
  showAs: string;
  viewerMode: boolean;
};

export const app = createModel<RootModel>()({
  state: {
    showAs: 'current',
    viewerMode: false,
  } as AppState,
  reducers: {
    enableViewerMode: (state, enabled: boolean) => ({
      ...state,
      viewerMode: enabled,
    }),
    showAs(state, role: string) {
      return {
        ...state,
        showAs: role,
      };
    },
    'Auth/onLogout': () => ({
      showAs: 'current',
      viewerMode: false,
    }),
  },
});
