import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { orange } from '@material-ui/core/colors';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';

import logger from '../../utils/logger';
import { useEditorCheck, useTesterCheck } from '../../hooks/use-role-check';
import { RootState } from '../../redux';
import { GraphicType } from '../../types';
import GraphicTypesHeader from './GraphicTypesHeader';
import FavoriteIcon from '../../components/FavoriteIcon';
import Loader from '../../components/Loader';

const useStyles = makeStyles((theme) => ({
  header: ({ small }: { small?: boolean }) => ({
    padding: '30px 40px',
    paddingLeft: small ? 16 : 40,
    paddingRight: small ? 16 : 40,
    alignItems: 'center',
  }),
  itemContainer: ({ small }: { small?: boolean }) => ({
    height: 54,
    paddingLeft: small ? 16 : 40,
    paddingRight: small ? 16 : 40,
    borderRight: `transparent 5px solid`,
  }),
  itemContainerEditor: {
    borderRight: `${theme.palette.secondary.main} 5px solid`,
  },
  item: {
    fontSize: 14,
  },
  selectedItem: {
    backgroundColor: '#FFAE63!important',
    color: 'white',
  },
  selectedText: {
    color: 'white',
  },
  actions: {},
  selectedActions: {
    color: 'white',
  },
  edit: {
    marginLeft: 4,
  },
  viewerMark: {
    display: 'inline-block',
    marginLeft: 20,
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#7bd7a0',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  subheader: {
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  itemtext: {
    fontSize: 15,
  },
  searchbutton: {
    border: '1px solid #80808038',
    borderRadius: 7,
    position: 'absolute',
    right: 30,
    top: 85,
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
  list: {
    overflowY: 'scroll',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  loader: {
    width: '100%',
    minHeight: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

interface Props extends StateProps {
  graphicTypes: GraphicType[];
  selectedId: string;
  loading: boolean;
  history: any;
  small: boolean;
  onSelect(graphicTypeId: string): void;
  onStarred(graphicType: GraphicType): void;
  onDeleteGraphicType(graphicType: GraphicType): void;
}

const sort = {
  viewerVisible(a: any, b: any) {
    if (!!a.viewerVisible === !!b.viewerVisible) {
      return this.favorite(a, b);
    }
    return a.viewerVisible ? -1 : 1;
  },
  favorite(a: any, b: any) {
    if (!!a.isFavorite === !!b.isFavorite) {
      return this.graphicName(a, b);
    }
    if (a.isFavorite) return -1;
    if (b.isFavorite) return 1;
  },
  graphicName(a: any, b: any) {
    return (get(a, 'graphicTypeName', '') || '').localeCompare(
      get(b, 'graphicTypeName', '') || ''
    );
  },
};

const Actions = (props: {
  selected: boolean;
  linkToEdit: string;
  graphicType: GraphicType;
  history: any;
  onDelete(): void;
  onStar(): void;
}) => {
  const classes = useStyles({ small: false });
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ListItemSecondaryAction
      className={
        classes.actions + (props.selected ? ' ' + classes.selectedActions : '')
      }>
      <IconButton
        onClick={handleClick}
        color={props.selected ? 'inherit' : 'default'}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <MenuItem
          onClick={(ev: any) => {
            ev.stopPropagation();
            const { graphicTypeId } = props.graphicType as GraphicType;
            props.history.push(`/dashboard/${graphicTypeId}`, {
              fromIP3: true,
            });
            handleClose();
          }}
          component={RouterLink}
          to={{ pathname: props.linkToEdit, state: { fromIP3: true } }}>
          <ListItemIcon style={{ minWidth: 36 }}>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>{t('graphic_type_action.edit')}</ListItemText>{' '}
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            if (props.onStar) props.onStar();
            e.stopPropagation();
            handleClose();
          }}>
          <ListItemIcon style={{ minWidth: 36 }}>
            <FavoriteIcon
              isFavorite={props.graphicType.isFavorite}
              inheritStyles
            />
          </ListItemIcon>
          <ListItemText>
            {props.graphicType.isFavorite
              ? t('graphic_type_action.unset_as_favorite')
              : t('graphic_type_action.set_as_favorite')}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            if (props.onDelete) props.onDelete();
            e.stopPropagation();
            handleClose();
          }}>
          <ListItemIcon style={{ minWidth: 36 }}>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>{t('graphic_type_action.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </ListItemSecondaryAction>
  );
};

const GraphicTypesList: React.FC<Props> = (props) => {
  const classes = useStyles({ small: props.small });
  const isEditor = useEditorCheck(props.user, props.showAs);
  const isTester = useTesterCheck(props.user, props.showAs);

  const [searchResults, setSearchResults] = useState(
    (props.graphicTypes || []).sort(sort.viewerVisible.bind(sort))
  );

  const onSearchResultsChanged = useCallback(setSearchResults, []);

  return (
    <React.Fragment>
      <GraphicTypesHeader
        graphicTypes={props.graphicTypes}
        onSearchResultsChanged={onSearchResultsChanged}
      />
      {props.loading ? (
        <div className={classes.loader}>
          <Loader size={40} />
        </div>
      ) : (
        <List className={classes.list}>
          {searchResults
            ? searchResults.map((graphicType) => {
                const selected = props.selectedId === graphicType.graphicTypeId;
                return (
                  <React.Fragment key={graphicType.graphicTypeId}>
                    <ListItem
                      button
                      className={
                        classes.itemContainer +
                        (graphicType.editorVisible && isTester
                          ? ' ' + classes.itemContainerEditor
                          : '')
                      }
                      onClick={() => {
                        logger.info('Dashboard/List/Select-Graphic-Type');
                        logger.debug('Clicked on graphic type', {
                          graphic: graphicType.graphicTypeId,
                        });
                        if (props.onSelect)
                          props.onSelect(graphicType.graphicTypeId);
                      }}
                      classes={{
                        selected: classes.selectedItem,
                      }}
                      selected={selected}>
                      {!props.small && (
                        <ListItemIcon>
                          <FavoriteIcon
                            isFavorite={graphicType.isFavorite}
                            color={selected ? 'white' : orange[500]}
                          />
                        </ListItemIcon>
                      )}
                      <ListItemText
                        className={
                          classes.item +
                          (selected ? ' ' + classes.selectedText : '')
                        }
                        primary={
                          <span className={classes.itemtext}>
                            {graphicType.graphicTypeName}
                          </span>
                        }
                      />
                      {isEditor ? (
                        <Actions
                          history={props.history}
                          graphicType={graphicType}
                          onDelete={() =>
                            props.onDeleteGraphicType(graphicType)
                          }
                          onStar={() => props.onStarred(graphicType)}
                          linkToEdit={`/edit/${graphicType.graphicTypeId}`}
                          selected={selected}
                        />
                      ) : null}
                      {graphicType.viewerVisible && isTester && (
                        <ListItemIcon>
                          <span className={classes.viewerMark}></span>
                        </ListItemIcon>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })
            : null}
        </List>
      )}
    </React.Fragment>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(GraphicTypesList);
