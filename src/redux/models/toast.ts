import { createModel } from '@rematch/core';
import { RootModel } from '.';

type ToastState = {
  showing: boolean;
  message: string;
  error: Error | boolean;
};

export const toast = createModel<RootModel>()({
  state: {
    showing: false,
    message: '',
    error: false,
  } as ToastState,
  reducers: {
    toggleToast(state, message: string, error: Error | boolean): ToastState {
      const showing = !!message;
      if (showing && typeof error === 'object') {
        console.error(message);
        console.error(error);
      }
      return {
        ...state,
        showing,
        message,
        error,
      };
    },
    hideToast(state): ToastState {
      return {
        ...state,
        showing: false,
      };
    },
  },
  effects: (dispatch) => ({
    handleToggleToast(args: { message: string; error?: Error | boolean }) {
      setTimeout(() => {
        dispatch.toast.toggleToast(args.message, args.error || false);
      }, 0);
    },
    handleHideToast() {
      dispatch.toast.hideToast();
    },
  }),
});
