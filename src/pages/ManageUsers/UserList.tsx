import React, { useState, useCallback } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import { orange } from '@material-ui/core/colors';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

import { User } from '../../types';
import UserListHeader from './UserListHeader';

const useStyles = makeStyles((theme) => ({
  itemContainer: {
    height: 54,
    paddingLeft: 40,
    paddingRight: 40,
    borderRight: `transparent 5px solid`,
  },
  list: {
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    overflowY: 'scroll',
  },
  item: {
    fontSize: 14,
  },
  selectedItem: {
    backgroundColor: `${theme.palette.primary.main}!important`,
    color: 'white',
  },
  selectedText: {
    color: 'white',
  },
}));

interface Props {
  users: User[];
  selectedUser?: User;
  onSelect(user: User): void;
}

const UserList: React.FC<Props> = (props) => {
  const classes = useStyles();

  const [users, setUsers] = useState(props.users || []);

  const onSearchResultsChanged = useCallback(setUsers, []);

  return (
    <React.Fragment>
      <UserListHeader
        users={props.users}
        onSearchResultsChanged={onSearchResultsChanged}
      />
      <List className={classes.list}>
        {users
          ? users.map((user) => {
              const selected =
                props.selectedUser &&
                props.selectedUser.Username === user.Username;
              const color = selected ? 'white' : orange[500];
              const { name, 'custom:position': position } = user.AttributesMap;
              return (
                <React.Fragment key={user.Username}>
                  <ListItem
                    button
                    className={classes.itemContainer}
                    onClick={() => props.onSelect(user)}
                    classes={{
                      selected: classes.selectedItem,
                    }}
                    selected={selected}>
                    <ListItemText
                      className={
                        classes.item +
                        (selected ? ' ' + classes.selectedText : '')
                      }
                      primary={<span>{name}</span>}
                      secondary={<span>{position}</span>}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => console.log} edge="end">
                        <PersonOutlineIcon
                          style={{
                            color,
                            fontSize: 20,
                          }}
                        />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })
          : null}
      </List>
    </React.Fragment>
  );
};

export default UserList;
