import axios from 'axios';
import logger from '../../utils/logger';
import { getApiBaseUrl } from '../../utils/url';
import env from '../../env.js';

const instance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'x-api-key': env.IP3_API_KEY,
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(function (config) {
  logger.debug('Contacting api', { apiConfig: config });
  const token = window.sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type AuthErrorListener = ((error: Error) => void) | null;
let authenticationErrorListener: AuthErrorListener = null;
export const setAuthenticationErrorListener = (
  listener: AuthErrorListener
): void => {
  authenticationErrorListener = listener;
};

instance.interceptors.response.use(
  function (response) {
    logger.debug('Receiving response from api', { apiResponse: response });
    return Promise.resolve(response);
  },
  (error) => {
    if (error.response?.status === 401 && authenticationErrorListener) {
      authenticationErrorListener(error);
    }
    logger.error('API Error', { api: error });
    return Promise.reject(error);
  }
);

export default instance;
