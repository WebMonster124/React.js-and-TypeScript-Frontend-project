import { datadogLogs } from '@datadog/browser-logs';
import env from '../env';

if (env.DATADOG_ENABLED) {
  datadogLogs.init({
    clientToken: 'pubf5963e1e605a1591490a42472b9361d8',
    site: 'datadoghq.eu',
    // forwardErrorsToLogs: true,
    sampleRate: 100,
  });
}

export default {
  addContext: (key: string, value: any): void => {
    if (!env.DATADOG_ENABLED)
      return console.log(`DATADOG: addContext(${key}, ${value})`);
    datadogLogs.logger.addContext(key, value);
  },
  removeContext: (key: string): void => {
    if (!env.DATADOG_ENABLED)
      return console.log(`DATADOG: removeContext(${key})`);
    datadogLogs.logger.removeContext(key);
  },
  info: (message: string, messageContent?: { [key: string]: any }): void => {
    if (!env.DATADOG_ENABLED) {
      if (messageContent) console.log('DATADOG:', message, messageContent);
      else console.log('DATADOG:', message);
      return;
    }
    datadogLogs.logger.info(message, messageContent);
  },
  debug: (message: string, messageContent?: { [key: string]: any }): void => {
    if (!env.DATADOG_ENABLED) {
      if (messageContent) console.log('DATADOG:', message, messageContent);
      else console.log('DATADOG:', message);
      return;
    }
    datadogLogs.logger.debug(message, messageContent);
  },
  error: (message: string, messageContent?: { [key: string]: any }): void => {
    if (!env.DATADOG_ENABLED) {
      if (messageContent) console.error('DATADOG:', message, messageContent);
      else console.error('DATADOG:', message);
      return;
    }
    datadogLogs.logger.info(message, messageContent);
  },
};
