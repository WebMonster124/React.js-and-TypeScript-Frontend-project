import { UserLike } from '../types';
import { useSmallScreenCheck } from './use-small-screen-check';
import {
  checkAdmin,
  checkDeveloper,
  checkEditor,
  checkTester,
  checkViewer,
} from '../utils/user';

export const useAdminCheck = (user: UserLike, showAs?: string): boolean => {
  const isSmallScreen = useSmallScreenCheck();
  return checkAdmin(user, showAs) && !isSmallScreen;
};

export const useDeveloperCheck = (user: UserLike, showAs?: string): boolean => {
  const isSmallScreen = useSmallScreenCheck();
  return checkDeveloper(user, showAs) && !isSmallScreen;
};

export const useEditorCheck = (user: UserLike, showAs?: string): boolean => {
  const isSmallScreen = useSmallScreenCheck();
  return checkEditor(user, showAs) && !isSmallScreen;
};

export const useTesterCheck = (user: UserLike, showAs?: string): boolean => {
  const isSmallScreen = useSmallScreenCheck();
  return checkTester(user, showAs) && !isSmallScreen;
};

export const useViewerCheck = (user: UserLike, showAs?: string): boolean => {
  const isSmallScreen = useSmallScreenCheck();
  return checkViewer(user, showAs) || isSmallScreen;
};
