import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Fuse from 'fuse.js';
import get from 'lodash/get';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

import { useSmallScreenCheck } from '../../hooks/use-small-screen-check';
import { useAdminCheck } from '../../hooks/use-role-check';
import Title from '../../components/Title';
import CreateGraphicType from './CreateGraphicType';
import { RootState } from '../../redux';

const useStyles = makeStyles({
  header: ({ small }: { small?: boolean }) => ({
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
  itemContainer: ({ small }) => ({
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
  graphicTypes: any[];
  onSearchResultsChanged(results: any[]): void;
}

const sort = {
  viewerVisible: function (a: any, b: any) {
    if (!!a.viewerVisible === !!b.viewerVisible) {
      return this.favorite(a, b);
    }
    return a.viewerVisible ? -1 : 1;
  },
  favorite: function (a: any, b: any) {
    if (!!a.isFavorite === !!b.isFavorite) {
      return this.graphicName(a, b);
    }
    if (a.isFavorite) return -1;
    if (b.isFavorite) return 1;
  },
  graphicName: function (a: any, b: any) {
    return (get(a, 'graphicTypeName', '') || '').localeCompare(
      get(b, 'graphicTypeName', '') || ''
    );
  },
};

const GraphicTypesHeader: React.FC<Props> = (props) => {
  const isSmallScreen = useSmallScreenCheck();
  const classes = useStyles({ small: isSmallScreen });
  const { t } = useTranslation();

  const { graphicTypes, showAs, user, onSearchResultsChanged } = props;

  const isAdmin = useAdminCheck(user, showAs);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const searchIndex = useRef<Fuse<any> | null>(null);

  useEffect(() => {
    searchIndex.current = new Fuse(graphicTypes, {
      keys: ['graphicTypeName'],
    });
  }, [graphicTypes]);

  useEffect(() => {
    if (searchIndex.current && debouncedQuery) {
      const result = searchIndex.current.search(debouncedQuery);
      onSearchResultsChanged(result.map((el) => el.item));
    } else {
      onSearchResultsChanged(
        (graphicTypes || []).sort(sort.viewerVisible.bind(sort))
      );
    }
  }, [graphicTypes, debouncedQuery, onSearchResultsChanged]);

  return (
    <div className={classes.header}>
      <div className={classes.titleHeader}>
        <Title className={classes.title} title={t('graphic_types.header')} />
        {isAdmin ? (
          <>
            <Button
              aria-label="add"
              className={classes.openModalButton}
              onClick={() => setOpen(true)}>
              <AddIcon />
            </Button>
            <CreateGraphicType
              open={open}
              requestClose={() => setOpen(false)}
            />
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
          placeholder={t('graphic_types.search')}
          value={query}
        />
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(GraphicTypesHeader);
