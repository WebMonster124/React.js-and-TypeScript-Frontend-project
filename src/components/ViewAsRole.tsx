import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useTranslation } from 'react-i18next';
import { RematchDispatch } from '@rematch/core';

import { RootModel, RootState } from '../redux';

const useStyles = makeStyles((theme) => ({
  viewerSwitchContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: `0 ${theme.spacing(1)}px`,
    whiteSpace: 'nowrap',
  },
  select: {
    marginLeft: 4,
  },
}));

const availableRoles = {
  admin: ['admin', 'developer', 'editor', 'tester', 'viewer'],
  developer: ['developer', 'editor', 'tester', 'viewer'],
  editor: ['editor', 'tester', 'viewer'],
  tester: ['tester', 'viewer'],
};

const ViewAsRole = (props: StateProps & DispatchProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  let roles = [];
  if (props.user && availableRoles[props.user.group]) {
    roles = availableRoles[props.user.group];
  }
  const [selectedRole, setSelectedRole] = useState(props.user.group);
  const handleSelectChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    props.showAs(newRole || 'current');
  };

  const { user } = props;
  useEffect(() => {
    if (user && user.group) {
      const choosableRoles = availableRoles[user.group];
      if (choosableRoles.length) setSelectedRole(choosableRoles[0]);
    }
  }, [user]);

  return (
    <div className={classes.viewerSwitchContainer}>
      <span>{t('view_as.label')}</span>
      <Select
        // size="small"
        value={(props.viewMode !== 'current' && props.viewMode) || selectedRole}
        onChange={handleSelectChange}
        className={classes.select}>
        {roles.map((role) => (
          <MenuItem value={role} key={role}>
            {t(`view_as.${role}`)}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  viewMode: state.app.showAs,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  showAs: dispatch.app.showAs,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(ViewAsRole);
