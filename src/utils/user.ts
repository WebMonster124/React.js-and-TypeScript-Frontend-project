import { User, UserAttribute, UserAttributesMap, UserLike } from '../types';
import { AuthUser } from '../types/auth-user';

export const getUserAttributes = (user: UserLike): UserAttributesMap => {
  if (typeof (user as AuthUser).attributes === 'object') {
    return (user as AuthUser).attributes;
  }
  return ((user as User).Attributes || []).reduce(
    (map: { [key: string]: string }, att: UserAttribute) => ({
      [att.Name]: att.Value,
      ...map,
    }),
    {}
  );
};

const isCurrent = (showAs: string) => (showAs ? showAs === 'current' : true);

export const checkAdmin = (user: UserLike, showAs?: string): boolean => {
  return (
    (user && user.group === 'admin' && isCurrent(showAs)) || showAs === 'admin'
  );
};

export const checkDeveloper = (user: UserLike, showAs?: string): boolean => {
  return (
    checkAdmin(user, showAs) ||
    (user && user.group === 'developer' && isCurrent(showAs)) ||
    showAs === 'developer'
  );
};

export const checkEditor = (user: UserLike, showAs?: string): boolean => {
  return (
    checkDeveloper(user, showAs) ||
    (user && user.group === 'editor' && isCurrent(showAs)) ||
    showAs === 'editor'
  );
};

export const checkTester = (user: UserLike, showAs?: string): boolean => {
  return (
    checkEditor(user, showAs) ||
    (user && user.group === 'tester' && isCurrent(showAs)) ||
    showAs === 'tester'
  );
};

export const checkViewer = (user: UserLike, showAs?: string): boolean => {
  return (
    checkTester(user, showAs) ||
    (user && user.group === 'viewer' && isCurrent(showAs)) ||
    showAs === 'viewer'
  );
};
