import { Graphic, GraphicBody, GraphicType } from '../types';

export const getCodeKey = (screen: string): string => {
  switch (screen) {
    case 'data':
      return 'dataTest';
    case 'note':
      return 'notes';
    case 'css-v0':
      return 'css0Test';
    case 'descriptors':
      return 'descriptorsTest';
    case 'config-editor':
      return 'configOnline';
    default:
      return '';
  }
};

export const getLastSavedByKey = (screen: string): string => {
  return getCodeKey(screen) + 'LastSavedBy';
};

export const getLastUpdateKey = (screen: string): string => {
  return getCodeKey(screen) + 'LastUpdate';
};

export const getOnlineCodeKey = (screen: string): string => {
  switch (screen) {
    case 'data':
      return 'dataOnline';
    case 'note':
      return 'notes';
    case 'css-v0':
      return 'css0Online';
    case 'descriptors':
      return 'descriptorsOnline';
    case 'config-editor':
      return 'configOnline';
    default:
      return '';
  }
};

export const getOnlineLastSavedByKey = (screen: string): string => {
  return getOnlineCodeKey(screen) + 'LastSavedBy';
};

export const getOnlineLastUpdateKey = (screen: string): string => {
  return getOnlineCodeKey(screen) + 'LastUpdate';
};

export const getDefaultCodeKey = (screen: string): string => {
  switch (screen) {
    case 'data':
      return 'dataDefault';
    case 'note':
      return '';
    case 'css-v0':
      return 'cssDefault';
    case 'descriptors':
      return 'descriptorsDefault';
    case 'config-editor':
      return 'configDefault';
    default:
      return '';
  }
};

export const getDefaultLastSavedByKey = (screen: string): string => {
  return getDefaultCodeKey(screen) + 'LastSavedBy';
};

export const getDefaultLastUpdateKey = (screen: string): string => {
  return getDefaultCodeKey(screen) + 'LastUpdate';
};

export const getCodeFromGraphic = (
  graphic: Graphic | GraphicType,
  screen: string,
  status = 'test'
): string => {
  if (!graphic) return;
  let code = '';
  switch (status) {
    case 'online':
      code = graphic[getOnlineCodeKey(screen)];
      break;
    case 'default':
      code = graphic[getDefaultCodeKey(screen)];
      break;
    default:
      code = graphic[getCodeKey(screen)];
  }
  const isValid =
    Boolean(code) || (typeof code == 'number' && !Number.isNaN(code));
  switch (screen) {
    case 'note':
      return (isValid && code) || '';
    case 'css-v0':
      return (isValid && code) || '';
    case 'data':
    case 'descriptors':
    case 'config-editor':
      return (isValid && JSON.stringify(code, null, 4)) || '';
    default:
      return '';
  }
};

export const getBodyFromCode = (code: string, screen: string): GraphicBody => {
  switch (screen) {
    case 'note':
      return { notes: code };
    case 'css-v0':
      return { css0Test: code };
    case 'data':
    case 'descriptors':
    case 'config-editor':
      return { [getCodeKey(screen)]: code ? JSON.parse(code) : '' };
    default:
      return {};
  }
};
