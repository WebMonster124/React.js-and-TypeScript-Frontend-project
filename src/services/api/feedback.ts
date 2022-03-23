import axios from './axios';
import { Feedback } from '../../types';

export const getFeedback = async (): Promise<Feedback[]> => {
  const res = await axios.get('/feedback');
  if (!res.data?.success) throw res.data?.error;
  return res.data?.items;
};

export const deleteFeedback = async (feedbackId: string): Promise<void> => {
  const res = await axios.delete('/feedback', { params: { feedbackId } });
  if (!res.data?.success) throw res.data?.error;
};

export const postFeedback = async (data: Feedback): Promise<void> => {
  const res = await axios.post('/feedback', data);
  if (!res.data?.success) throw res.data?.error;
};
