import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';

import logger from '../utils/logger';
import { useViewerCheck } from '../hooks/use-role-check';

import imgDefaultAvatar from '../assets/avatar.png';
import { RootModel, RootState } from '../redux';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    cursor: 'pointer',
    marginLeft: theme.spacing(1),
  },
  name: {
    marginRight: theme.spacing(1),
    width: 'min-content',
    whiteSpace: 'nowrap',
  },
  avatar: {
    width: 24,
  },
}));

interface Props extends StateProps, DispatchProps {
  className?: string;
  onLogout(): void;
}

export const Profile: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const isViewer = useViewerCheck(props.user);
  const [anchor, setAnchor] = useState<Element>(null);

  const handleClick = (e: { currentTarget: Element }) => {
    setAnchor(e.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleLogout = () => {
    logger.info('App/Header/Profile/Logout-Handler');
    handleClose();
    props.logout().then(() => props.onLogout());
  };

  const classes = useStyles();
  let name = '';
  if (props.user) name = get(props.user, 'attributes.name', name);
  return (
    <>
      {isViewer ? null : null}
      <div
        className={
          classes.root + (props.className ? ' ' + props.className : '')
        }
        onClick={handleClick}>
        <span className={classes.name}>
          {name ? `${t('appbar.hello')} ${name}` : ''}
        </span>
        <img className={classes.avatar} src={imgDefaultAvatar} alt="Avatar" />
      </div>
      <Menu
        anchorEl={anchor}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        keepMounted
        open={Boolean(anchor)}
        onClose={handleClose}>
        <MenuItem onClick={handleLogout}>{t('appbar.logout')}</MenuItem>
      </Menu>
    </>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  logout: dispatch.auth.logout,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Profile);
