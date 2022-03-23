import { Graphic, GraphicType, UserLike } from '../types';
import {
  useDeveloperCheck,
  useEditorCheck,
  useTesterCheck,
} from './use-role-check';

export const useGraphicAccessCheck = (
  user: UserLike,
  showAs?: string
): ((g: Graphic | GraphicType) => boolean) => {
  const isDeveloper = useDeveloperCheck(user, showAs);
  const isEditor = useEditorCheck(user, showAs);
  const isTester = useTesterCheck(user, showAs);
  return (g?: Graphic | GraphicType): boolean => {
    if (!g) return false;
    if (isDeveloper) return true;
    if (isEditor) return g?.editorVisible;
    if (isTester) return true;
    return g?.viewerVisible;
  };
};
