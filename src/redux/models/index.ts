import { Models } from '@rematch/core';

import { app } from './app';
import { assets } from './assets';
import { auth } from './auth';
import { errors } from './errors';
import { feedback } from './feedback';
import { graphic } from './graphic';
import { graphicType } from './graphic-type';
import { toast } from './toast';
import { user } from './user';

export interface RootModel extends Models<RootModel> {
  app: typeof app;
  assets: typeof assets;
  auth: typeof auth;
  errors: typeof errors;
  feedback: typeof feedback;
  graphic: typeof graphic;
  graphicType: typeof graphicType;
  toast: typeof toast;
  user: typeof user;
}

export const models: RootModel = {
  app,
  assets,
  auth,
  errors,
  feedback,
  graphic,
  graphicType,
  toast,
  user,
};
