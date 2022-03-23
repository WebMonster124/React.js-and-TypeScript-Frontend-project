import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';

import { User } from '../../types';
import { RootState } from '../../redux';
import { useSmallScreenCheck } from '../../hooks/use-small-screen-check';
import { useAdminCheck } from '../../hooks/use-role-check';
import Title from '../../components/Title';
import CreateUser from './CreateUser';

const useStyles = makeStyles({
  header: ({ small }: { small: boolean }) => ({
    padding: '30px 40px',
    paddingLeft: small ? 16 : 40,
    paddingRight: small ? 16 : 40,
    alignItems: 'center',
  }),
  title: {
    flexGrow: 1,
  },
  titleHeader: {
    width: '100%',
    display: 'flex',
    marginBottom: '30px',
    alignItems: 'center',
    minHeight: 30,
  },
  search: {},
  searchform: {
    padding: '2px 4px',
    display: 'flex',
    border: '1px solid #f0f0f0',
    alignItems: 'center',
  },
  itemContainer: ({ small }: { small: boolean }) => ({
    height: 54,
    paddingLeft: small ? 16 : 40,
    paddingRight: small ? 16 : 40,
    borderRight: `transparent 5px solid`,
  }),
  item: {
    fontSize: 14,
  },
  openModalButton: {
    width: 30,
    minWidth: 30,
    height: 30,
    borderRadius: '4px',
    padding: 0,
    backgroundColor: '#023f37',
    color: 'white',
    fontFamily: 'Rubik',
    fontSize: '18px',
    fontWeight: 400,
  },
  input: {},
});

interface Props extends StateProps {
  users: User[];
  onSearchResultsChanged(results: any[]): void;
}

const UserListHeader = (props: Props) => {
  const isSmallScreen = useSmallScreenCheck();
  const classes = useStyles({ small: isSmallScreen });

  const { showAs, user, users, onSearchResultsChanged } = props;

  const isAdmin = useAdminCheck(user, showAs);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const searchIndex = useRef(null);

  useEffect(() => {
    searchIndex.current = new Fuse(users, {
      keys: ['AttributesMap.name', 'AttributesMap.custom:position', 'group'],
    });
  }, [users]);

  useEffect(() => {
    if (searchIndex.current && debouncedQuery) {
      const result = searchIndex.current.search(debouncedQuery);
      onSearchResultsChanged(result.map((el) => el.item));
    } else {
      onSearchResultsChanged(users || []);
    }
  }, [users, debouncedQuery, onSearchResultsChanged]);

  return (
    <div className={classes.header}>
      <div className={classes.titleHeader}>
        <Title className={classes.title} title="Users" />
        {isAdmin ? (
          <>
            <Button
              aria-label="add"
              className={classes.openModalButton}
              onClick={() => setOpen(true)}>
              <AddIcon />
            </Button>
            <CreateUser open={open} requestClose={() => setOpen(false)} />
          </>
        ) : null}
      </div>
      <div className={classes.searchform}>
        <IconButton aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          className={classes.input}
          fullWidth
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="Search Users..."
          value={query}
        />
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  showAs: state.app.showAs,
  user: state.auth,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(UserListHeader);
