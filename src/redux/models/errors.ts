import { createModel } from '@rematch/core';
import { RootModel } from '.';

export const errors = createModel<RootModel>()({
  state: {},
  effects: (dispatch) => ({
    handle(args: { error: any; withToast?: string }) {
      if (args.withToast) {
        dispatch.toast.toggleToast(args.withToast, true);
      }
      console.error('Error:', args.error?.message || args.error);
    },
  }),
});
