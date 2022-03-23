import { useMediaQuery } from '@material-ui/core';

export const useSmallScreenCheck = (maxWidth?: number): boolean => {
  return false;
  return useMediaQuery(`(max-width:${maxWidth || 850}px)`);
};
