import { createModel } from '@rematch/core';
import { RootModel } from '.';
import { User, UserUpdates } from '../../types/user';
import * as api from '../../services/api/user';

type State = {
  [key: string]: User;
};

export const user = createModel<RootModel>()({
  state: {} as State,
  reducers: {
    onLoadUsers(state, users: User[]) {
      return users.reduce((map, user) => {
        user.AttributesMap = user.Attributes.reduce(
          (attMap, att) => ({
            [att.Name]: att.Value,
            ...attMap,
          }),
          {}
        );
        map[user.Username] = user;
        return map;
      }, {} as { [key: string]: User });
    },
    onDeleteUser(state, username: string) {
      const newState = { ...state };
      delete newState[username];
      return newState;
    },
    'Auth/onLogout': function () {
      return {};
    },
  },
  effects: (dispatch) => ({
    async getUsers() {
      const users = await api.getUsers();
      dispatch.user.onLoadUsers(users);
    },
    async addUser(payload: {
      email: string;
      password: string;
      group: string;
      userAttributes: { [key: string]: string };
    }) {
      await api.addUser(payload);
      this.getUsers();
    },
    async updateUser(payload: UserUpdates) {
      await api.updateUser(payload);
      this.getUsers();
    },
    async deleteUser({ email, username }: { email: string; username: string }) {
      await api.deleteUser(email);
      dispatch.user.onDeleteUser(username);
    },
  }),
  selectors: (slice) => ({
    allUsers() {
      return slice((state) => Object.values(state));
    },
  }),
});
