import React from 'react';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import Title from '../../components/Title';
import Button from '../../components/Button';
import { RootModel, RootState } from '../../redux';
import { RematchDispatch } from '@rematch/core';
import { User } from '../../types';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 10,
    padding: 30,
    flexBasis: 340,
    flexGrow: 1,
  },
  title: {
    paddingBottom: 30,
  },
  newPassword: {
    color: 'white',
    backgroundColor: '#85b5ff',
    marginBottom: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#85b5ff',
    },
  },
  welcome: {
    color: 'white',
    marginBottom: theme.spacing(2),
    backgroundColor: '#3a8d82',
    '&:hover': {
      backgroundColor: '#3a8d82',
    },
  },
  delete: {
    color: 'white',
    backgroundColor: '#ff7575',
    '&:hover': {
      backgroundColor: '#ff7575',
    },
  },
}));

interface Props extends StateProps, DispatchProps {
  user: User;
  onDelete(): void;
}

const Actions = (props: Props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  let email = '';
  const emailAttribute = props.user.Attributes.find(
    (att) => att.Name === 'email'
  );
  if (emailAttribute) email = emailAttribute.Value;

  const handleDelete = () => {
    props
      .deleteUser({
        email,
        username: props.user.Username,
      })
      .then(() => {
        enqueueSnackbar('User deleted', {
          variant: 'success',
        });
        if (props.onDelete) props.onDelete();
      })
      .catch(() => {
        enqueueSnackbar('Error deleting user', {
          variant: 'error',
        });
      });
  };
  return (
    <Paper className={classes.root}>
      <Title className={classes.title} title="Actions" />
      <Button
        disabled
        fullWidth
        variant="contained"
        color="primary"
        className={classes.newPassword}
        startIcon={<PeopleOutlineIcon />}>
        Send New Password by Email
      </Button>
      <Button
        disabled
        fullWidth
        variant="contained"
        color="primary"
        className={classes.welcome}
        startIcon={<MailOutlineIcon />}>
        Send Welcome Email with Tutorial
      </Button>
      <Button
        fullWidth
        disabled={props.deleting}
        variant="contained"
        color="primary"
        onClick={handleDelete}
        className={classes.delete}
        startIcon={<DeleteForeverIcon />}>
        Delete User
      </Button>
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  deleting: state.loading.effects.user.deleteUser,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  deleteUser: dispatch.user.deleteUser,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Actions);
