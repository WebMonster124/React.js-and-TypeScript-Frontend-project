import { parse, stringify } from 'query-string';
import { mergeWith } from 'lodash';
import { Config } from '../types';

export const mergeConfig = (configDefault: Config, config: Config): Config =>
  mergeWith({}, configDefault, config, (o, s) => {
    if (Array.isArray(s)) return s;
    // if o == { value: false } and s == true then return { value: true }
    if (!o || o.value === undefined) return;
    if (
      typeof s === 'boolean' ||
      typeof s === 'number' ||
      typeof s === 'string'
    ) {
      return { ...o, value: s };
    }
  });

export const configToQuery = (
  config: Config,
  omitHiddenFields = false
): string => {
  if (!config || typeof config !== 'object') return '';
  const queryObj = Object.keys(config)
    .filter((key) => !omitHiddenFields || !config[key].hidden)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: config[key].value,
      }),
      {}
    );
  return stringify(queryObj);
};

const ia = <T>(array: T | T[]) => Array.isArray(array);

export const overwriteWithQuery = (config: Config, query: string): Config => {
  if (!query) return config;
  const queryObj = parse(query, { parseBooleans: true, parseNumbers: true });
  const updatedConfig = Object.keys(queryObj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...acc[key],
        value:
          ia(acc[key].value) && !ia(queryObj[key])
            ? [queryObj[key]]
            : queryObj[key],
      },
    }),
    config
  );
  return updatedConfig;
};
