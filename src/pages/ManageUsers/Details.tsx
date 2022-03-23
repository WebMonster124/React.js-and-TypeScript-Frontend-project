import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import SaveIcon from '@material-ui/core/SvgIcon/SvgIcon';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useTranslation } from 'react-i18next';
import get from 'lodash/get';

import { User } from '../../types';
import { RootModel, RootState } from '../../redux';
import { getUserAttributes } from '../../utils/user';
import Title from '../../components/Title';
import Button from '../../components/Button';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 10,
    padding: 30,
    flexBasis: 360,
    flexGrow: 1,
  },
  title: {
    paddingBottom: 30,
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  textfield: {
    fontSize: 12,
    marginBottom: theme.spacing(5),
    width: '100%',
  },
}));

const availableLanguages = {
  'en-us': 'English',
  'de-de': 'German',
};

interface Props extends StateProps, DispatchProps {
  user: User;
  isAuthUser: boolean;
}

const Details = (props: Props) => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const editorAccessOptions = {
    data: 'Data',
    dataFunction: 'Data Function',
    notes: 'Notes',
    descriptors: 'Descriptors',
    css: 'CSS',
    config: 'Config',
    configVisual: 'Config Visual',
    configEditor: 'Config Editor',
    assets: 'Assets',
  };

  const [group, setGroup] = useState(get(props.user, 'group', ''));
  const [graphicsAccess, setGraphicsAccess] = useState(
    get(props.user, 'graphicsAccess', Array<string>())
  );
  const [editorAccess, setEditorAccess] = useState(
    get(props.user, 'editorAccess', Array<string>())
  );
  const userAttributes = getUserAttributes(props.user);
  const [name, setName] = useState(get(userAttributes, 'name', ''));
  const [position, setPosition] = useState(
    get(userAttributes, 'custom:position', '')
  );
  const [email, setEmail] = useState(get(userAttributes, 'email', ''));
  const [phone, setPhone] = useState(get(userAttributes, 'phone_number', ''));
  const [locale, setLocale] = useState(get(userAttributes, 'locale', ''));
  const [notes, setNotes] = useState(get(userAttributes, 'custom:notes', ''));

  const handleTextChange = (handler: any) => (e: any) => {
    return handler(e.target.value);
  };

  useEffect(() => {
    if (!Object.keys(availableLanguages).includes(locale)) {
      setLocale('en-us');
    } else if (props.isAuthUser) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n, props.isAuthUser]);

  const handleSave = () => {
    props
      .updateUser({
        email,
        group,
        editorAccess: editorAccess.filter(Boolean),
        graphicsAccess: graphicsAccess.filter(Boolean),
        userAttributes: {
          'custom:notes': notes,
          'custom:position': position,
          locale: locale,
          name,
          phone_number: phone,
        },
      })
      .then(() => {
        enqueueSnackbar('User updated', {
          variant: 'success',
        });
      })
      .catch(() => {
        enqueueSnackbar('Error updating user', {
          variant: 'error',
        });
      });
  };

  return (
    <Paper className={classes.root}>
      <Title className={classes.title} title="User Details" />
      <TextField
        value={name}
        onChange={handleTextChange(setName)}
        label="Name"
        className={classes.textfield}
        variant="outlined"
        placeholder="Name"
      />
      <TextField
        value={position}
        onChange={handleTextChange(setPosition)}
        label="Position"
        className={classes.textfield}
        variant="outlined"
        placeholder="Position"
      />
      <TextField
        disabled
        value={group}
        onChange={handleTextChange(setGroup)}
        label="Group"
        className={classes.textfield}
        variant="outlined"
      />
      <TextField
        disabled
        value={email}
        onChange={handleTextChange(setEmail)}
        label="Email"
        className={classes.textfield}
        variant="outlined"
        placeholder="Email"
      />
      <TextField
        value={phone}
        onChange={handleTextChange(setPhone)}
        label="Phone Number"
        className={classes.textfield}
        variant="outlined"
        placeholder="Phone Number"
      />
      <TextField
        value={
          locale?.toLowerCase() === 'english'
            ? 'en-us'
            : locale?.toLowerCase() === 'german'
            ? 'de-de'
            : locale || 'en-us'
        }
        onChange={handleTextChange(setLocale)}
        label="Language"
        className={classes.textfield}
        variant="outlined"
        placeholder="Language"
        select>
        {Object.keys(availableLanguages).map((l) => (
          <MenuItem key={l} value={l}>
            {availableLanguages[l]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={notes}
        onChange={handleTextChange(setNotes)}
        label="Notes"
        multiline
        rows="6"
        className={classes.textfield}
        variant="outlined"
        placeholder="Notes"
      />
      <TextField
        value={graphicsAccess?.join('\n')}
        onChange={(e) => setGraphicsAccess(e.target.value?.split('\n'))}
        label="Graphics Access"
        multiline
        rows="6"
        className={classes.textfield}
        variant="outlined"
        placeholder="https://input.embeddable.graphics/dashboard/<graphic>/<version>"
      />
      <Autocomplete
        multiple
        options={Object.keys(editorAccessOptions)}
        getOptionLabel={(key) => editorAccessOptions[key]}
        value={editorAccess}
        onChange={(_, value) => setEditorAccess(value)}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField
            {...params}
            label="Editor Access"
            className={classes.textfield}
            variant="outlined"
          />
        )}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        disabled={props.updating}
        onClick={handleSave}
        startIcon={<SaveIcon />}>
        Save Changes
      </Button>
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  updating: state.loading.effects.user.updateUser,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  updateUser: dispatch.user.updateUser,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Details);
