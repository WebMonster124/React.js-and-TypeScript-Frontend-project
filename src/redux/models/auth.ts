import { Auth } from 'aws-amplify';
import get from 'lodash/get';
import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { getUsers } from '../../services/api/user';
import logger from '../../utils/logger';
import { AuthUser } from '../../types/auth-user';
import { User } from '../../types';

type AuthState = AuthUser;

export const auth = createModel<RootModel>()({
  state: null as AuthState,
  reducers: {
    onLogin(state, user: AuthState) {
      logger.info('Redux/Auth/reducers/onLogin');
      logger.addContext('username', user.attributes.name || user.username);
      const newState = user;
      logger.debug('Extracting relevant info', {
        username: user.attributes.name || user.username,
      });
      const jwtToken = get(user, 'signInUserSession.idToken.jwtToken', '');
      const payload = get(user, 'signInUserSession.idToken.payload', {});
      logger.debug('Saving token in async storage', {
        username: user.attributes.name || user.username,
      });
      window.sessionStorage.setItem('token', jwtToken);
      const groups = get(payload, 'cognito:groups', []);
      if (groups.length) {
        newState.group = groups[0].toLowerCase();
        logger.debug('User group extracted', {
          username: user.attributes.name || user.username,
          group: newState.group,
        });
      }
      return newState as AuthState;
    },
    onAssignUserData(state, users: User[]) {
      const userData = users.find((u) => u.Username === state.username);
      if (userData) {
        state.editorAccess = [...userData.editorAccess];
        state.graphicsAccess = [...userData.graphicsAccess];
      }
      return state;
    },
    onLogout() {
      logger.info('Redux/Auth/reducers/onLogout');
      logger.debug('Cleaning auth state');
      logger.removeContext('username');
      return null;
    },
  },
  effects: (dispatch) => ({
    async boot() {
      logger.info('Redux/Auth/effects/boot');
      logger.debug('Getting previous user');
      try {
        const user: AuthUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        logger.debug('Resuming with previous user', {
          username: user.attributes.name || user.username,
        });
        dispatch.auth.onLogin(user);
      } catch (error) {
        logger.debug('User has not been found');
        logger.debug('Clearing storage');
        window.sessionStorage.removeItem('token');
        dispatch.errors.handle({ error });
      }
    },
    async login({ email, password }: { email: string; password: string }) {
      logger.info('Redux/Auth/effects/login');
      logger.debug('Login user with email', { email });
      let user: AuthUser = await Auth.signIn(email, password);
      logger.debug('User signed in', {
        username: user.attributes.name || user.username,
      });
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        logger.debug('New password required for user');
        dispatch.auth.onLogin(user);
        return 'requireNewPassword';
      } else if (user.challengeName === 'SMS_MFA') {
        logger.debug('Confirmation code required');
        dispatch.auth.onLogin(user);
        return 'confirmSignIn';
      }
      logger.debug('Getting auth data', {
        username: user.attributes.name || user.username,
      });
      user = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });
      dispatch.auth.onLogin(user);
      return 'signedIn';
    },
    async fetchUserData() {
      const users = await getUsers();
      dispatch.auth.onAssignUserData(users);
    },
    async loginAsGuest() {
      logger.info('Redux/Auth/effects/loginAsGuest');
      const email = 'guestuser@data2visual.de';
      const password = 'Guestuser1!';
      logger.debug('Login user with email', { email });
      let user: AuthUser = await Auth.signIn(email, password);
      logger.debug('User signed in', {
        username: user.attributes.name || user.username,
      });
      logger.debug('Getting auth data', {
        username: user.attributes.name || user.username,
      });
      user = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });
      dispatch.auth.onLogin(user);
      return 'signedIn';
    },
    async changePassword({
      password,
      user,
    }: {
      password: string;
      user: AuthState;
    }) {
      logger.info('Redux/Auth/effects/changePassword');
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        logger.debug('Changing password for user', {
          username: user.attributes.name || user.username,
        });
        let newUser: AuthUser = await Auth.completeNewPassword(user, password);
        if (newUser.challengeName === 'SMS_MFA') {
          logger.debug('Confirmation code required');
          dispatch.auth.onLogin(newUser);
          return 'confirmSignIn';
        }
        logger.debug('Getting auth data', {
          username: user.attributes.name || user.username,
        });
        newUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        dispatch.auth.onLogin(newUser);
        return 'signedIn';
      }
    },
    async verifyCode({ code, user }: { code: string; user: AuthState }) {
      logger.info('Redux/Auth/effects/verifyCode');
      if (user.challengeName === 'SMS_MFA') {
        logger.debug('Verifying confirmation code for user', {
          username: user.attributes.name || user.username,
        });
        let newUser: AuthUser = await Auth.confirmSignIn(user, code, 'SMS_MFA');
        if (newUser.challengeName === 'NEW_PASSWORD_REQUIRED') {
          logger.debug('New password required for user');
          dispatch.auth.onLogin(newUser);
          return 'requireNewPassword';
        }
        logger.debug('Getting auth data', {
          username: user.attributes.name || user.username,
        });
        newUser = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        dispatch.auth.onLogin(newUser);
        return 'signedIn';
      }
    },
    async logout() {
      logger.info('Redux/Auth/effects/logout');
      await Auth.signOut();
      logger.debug('User signed out from amplify');
      dispatch.auth.onLogout();
    },
  }),
});
