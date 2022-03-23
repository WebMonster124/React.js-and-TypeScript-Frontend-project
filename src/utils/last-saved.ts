import moment from 'moment';
import { Graphic, User } from '../types';
import {
  getOnlineLastUpdateKey,
  getOnlineLastSavedByKey,
  getLastSavedByKey,
  getLastUpdateKey,
} from './mapper';

const getLastSavedBy = (lastSavedBy: string, users: User[]): string => {
  if (!lastSavedBy) return '';
  if (lastSavedBy === 'function-editor') return 'Function Editor';
  const lastSavedByUser = users.find((u) => u.Username === lastSavedBy);
  const lastSavedByName = lastSavedByUser?.AttributesMap.name;
  const lastSavedByEmail = lastSavedByUser?.AttributesMap.email;
  return lastSavedByName || lastSavedByEmail || lastSavedBy;
};

const getLastUpdateTime = (lastSavedTimestamp: string): string => {
  if (!lastSavedTimestamp) return '';
  return moment(lastSavedTimestamp).fromNow();
};

const _getLastUpdateText = (
  graphic: Graphic,
  screen: string,
  users: User[],
  getLastSavedByKey: (screen: string) => string,
  getLastUpdateKey: (screen: string) => string
): string => {
  const savedByKey = getLastSavedByKey(screen);
  const lastSavedByText = getLastSavedBy(graphic[savedByKey], users);
  const lastUpdateKey = getLastUpdateKey(screen);
  const lastSavedTimeText = getLastUpdateTime(graphic[lastUpdateKey]);
  const list = [
    lastSavedTimeText,
    lastSavedByText ? `by ${lastSavedByText}` : null,
  ].filter(Boolean);
  return list.length > 0 ? `updated ${list.join(' ')}` : '';
};

export const getLastUpdateText = (
  graphic: Graphic,
  screen: string,
  users: User[]
): string => {
  return _getLastUpdateText(
    graphic,
    screen,
    users,
    getLastSavedByKey,
    getLastUpdateKey
  );
};

export const getOnlineLastUpdateText = (
  graphic: Graphic,
  screen: string,
  users: User[]
): string => {
  return _getLastUpdateText(
    graphic,
    screen,
    users,
    getOnlineLastSavedByKey,
    getOnlineLastUpdateKey
  );
};
