import env from '../env.js';

export const getApiBaseUrl = (): string => {
  return env.IP3_API_URL;
};

export const getGraphicAssetsUrl = (): string => {
  return env.IP3_ASSETS_URL;
};

export const createGraphicUrl = (graphicId: string, query: string): string => {
  return `${getApiBaseUrl()}graphicVersion/load/${graphicId}?${query}`;
};

export const createGraphicBundleUrl = (graphicTypeId: string): string => {
  return `${getGraphicAssetsUrl()}${graphicTypeId}/bundle.js`;
};

export const createGraphicDataUrl = (
  graphicId: string,
  test = false
): string => {
  const url = `${getApiBaseUrl()}graphicVersions/data`;
  const query = `?graphicVersionId=${graphicId}`;
  return url + query + (test ? '&data=test&descriptors=test' : '');
};
