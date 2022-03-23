import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';

import { User } from '../../types';
import { useAdminCheck } from '../../hooks/use-role-check';
import { RootModel, RootState, store } from '../../redux/index';
import Drawer from '../../components/Drawer';
import Default from '../../components/Default';
import UserList from './UserList';
import Details from './Details';
import Actions from './Actions';

const drawerWidth = 391;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexGrow: 1,
  },
  details: {
    alignItems: 'flex-start',
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    overflowY: 'scroll',
    padding: 10,
  },
});

const UsersManager: React.FC<StateProps & DispatchProps> = (props) => {
  const classes = useStyles();

  const isAdmin = useAdminCheck(props.user, props.showAs);

  const [selectedUser, setSelectedUser] = useState<User>();

  const { getUsers, users } = props;
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (!isAdmin) return <div />;

  return (
    <div className={classes.root}>
      <Drawer width={drawerWidth}>
        <UserList
          users={users}
          onSelect={setSelectedUser}
          selectedUser={selectedUser}
        />
      </Drawer>
      <main className={classes.details}>
        {selectedUser && props.users && props.users.length ? (
          <>
            <Details
              key={selectedUser.Username}
              user={selectedUser}
              isAuthUser={props.user.username === selectedUser.Username}
            />
            <Actions
              onDelete={() => setSelectedUser(null)}
              user={selectedUser}
            />
          </>
        ) : (
          <Default
            header="Select a User"
            message="You have not selected any User from the Left Menu yet."
          />
        )}
      </main>
    </div>
  );
};

const mapState = (state: RootState) => ({
  showAs: state.app.showAs,
  user: state.auth,
  users: store.select.user.allUsers(state),
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getUsers: dispatch.user.getUsers,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(UsersManager);
