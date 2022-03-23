import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { Feedback } from '../../types';
import * as api from '../../services/api/feedback';
import logger from '../../utils/logger';

type FeedbackState = {
  [key: string]: Feedback;
};

export const feedback = createModel<RootModel>()({
  state: {} as FeedbackState,
  reducers: {
    onLoadAllFeedback(state, feedback: Feedback[]) {
      logger.info('Redux/Feedback/reducers/onLoadAllFeedback');
      logger.debug('Replacing current feedback entries with new ones', {
        feedback: feedback.map((fb) => fb.feedbackId),
      });
      return feedback.reduce((newState: FeedbackState, entry) => {
        newState[entry.feedbackId] = entry;
        return newState;
      }, {});
    },
    onLoadFeedback(state, feedback: Feedback) {
      logger.info('Redux/Feedback/reducers/onLoadFeedback');
      logger.debug('Adding new feedback entry to state', {
        feedback: feedback.feedbackId,
      });
      return {
        ...state,
        [feedback.feedbackId || Date.now().toString()]: feedback,
      };
    },
    onDeleteFeedback(state, feedbackId: string) {
      logger.info('Redux/Feedback/reducers/onDeleteFeedback');
      logger.debug('Deleting feedback in state', {
        feedback: feedbackId,
      });
      const newState = { ...state };
      delete newState[feedbackId];
      return newState;
    },
    'Auth/onLogout': function () {
      logger.debug('Cleaning feedback state');
      return {};
    },
  },
  effects: (dispatch) => ({
    async getFeedback() {
      logger.info('Redux/Feedback/effects/getFeedback');
      logger.debug('Getting feedback entries');
      const feedback = await api.getFeedback();
      logger.debug('Updating redux state');
      dispatch.feedback.onLoadAllFeedback(feedback);
    },
    async deleteFeedback(feedbackId: string, state: FeedbackState) {
      const backup = { ...state[feedbackId], feedbackId };
      if (!backup) {
        dispatch.toast.handleToggleToast({
          message: 'Feedback does not exist',
          error: true,
        });
        console.error('Feedback does not exist');
        return;
      }
      dispatch.feedback.onDeleteFeedback(feedbackId);
      try {
        await api.deleteFeedback(feedbackId);
        dispatch.toast.handleToggleToast({
          message: 'Successfully deleted Feedback',
        });
      } catch (e) {
        dispatch.feedback.onLoadFeedback(backup);
        dispatch.toast.handleToggleToast({
          message: 'Error deleting Feedback',
          error: true,
        });
        console.error('Error deleting Feedback:', e?.message || e);
      }
    },
    async postFeedback(data: Feedback) {
      try {
        await api.postFeedback(data);
        dispatch.feedback.onLoadFeedback(data);
        dispatch.toast.handleToggleToast({
          message: 'Successfully posted Feedback',
        });
        dispatch.feedback.getFeedback();
      } catch (e) {
        dispatch.toast.handleToggleToast({
          message: 'Error posting Feedback',
          error: true,
        });
        console.error('Error posting Feedback:', e?.message || e);
      }
    },
  }),
  selectors: (slice, createSelector) => ({
    allFeedback() {
      return slice((state: FeedbackState) => Object.values(state));
    },
    feedbackById() {
      return createSelector(
        slice,
        (state: FeedbackState, id: string) => id,
        (state: FeedbackState, id: string) => state[id]
      );
    },
  }),
});
