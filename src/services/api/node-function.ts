import axios, { AxiosResponse } from 'axios';
import env from '../../env.js';

export const saveFunction = (
  graphicId: string,
  code: string,
  result_destination: string
): Promise<AxiosResponse> => {
  const data = { graphicId, code, result_destination };
  return axios.post(env.SAVE_FUNCTION_URL, data);
};

export const getFunction = async (graphicId: string): Promise<any> => {
  const data = { graphicId };
  const res = await axios.post(env.GET_FUNCTION_URL, data);
  if (res.status === 200) return res.data?.Item;
  if (res.statusText) throw new Error(res.statusText);
};

export const runFunction = (graphicId: string): Promise<AxiosResponse> => {
  const data = { graphicId };
  return axios.post(env.RUN_FUNCTION_URL, data);
};

export const scheduleFunction = (
  graphicId: string,
  minutes: number
): Promise<AxiosResponse> => {
  const data = { code: graphicId, schedule: minutes };
  return axios.post(env.SCHEDULE_FUNCTION_URL, data);
};
