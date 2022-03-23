import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import PWDV from 'password-validator';
import Select from '@material-ui/core/Select';
import SvgIcon from '@material-ui/core/SvgIcon';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import Button from '../../components/Button';
import { RootModel, RootState } from '../../redux';
import { RematchDispatch } from '@rematch/core';

const pwdSchema = new PWDV();
pwdSchema.is().min(8).has().uppercase().has().digits().has().symbols();

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 20,
    flexGrow: 1,
    display: 'flex',
    fontFamily: '"Playfair Display", serif',
  },
  titleHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '33px',
  },
  addGraphicInput: {
    marginBottom: '15px',
  },
  addGraphicButton: {
    height: theme.spacing(6),
    marginBottom: 20,
  },
}));

const CopyIcon: React.FC = () => (
  <SvgIcon>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </SvgIcon>
);

interface Props extends StateProps, DispatchProps {
  open: boolean;
  requestClose(): void;
}

const CreateUser: React.FC<Props> = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Viewer');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const classes = useStyles();
  const handleAddUser = () => {
    props
      .addUser({
        email,
        password,
        group: role,
        userAttributes: {
          name,
          phone_number: phone,
        },
      })
      .then(() => {
        enqueueSnackbar('User added', {
          variant: 'success',
        });
        props.requestClose();
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
      })
      .catch(() => {
        enqueueSnackbar('Error adding user', {
          variant: 'error',
        });
      });
  };

  const text = `Your InputTool-3 Credentials are:\nMail: ${email}\nPassword: ${password}\nPhone: ${phone}\n\nYou can login through this link:\nhttps://input.embeddable.graphics/`;

  return (
    <Dialog open={props.open} onClose={props.requestClose}>
      <DialogContent>
        <div className={classes.titleHeader}>
          <Typography variant="h2" className={classes.title}>
            Add New User
          </Typography>
          <CopyToClipboard
            text={text}
            onCopy={() => {
              enqueueSnackbar('User info copied', { variant: 'success' });
            }}>
            <IconButton>
              <CopyIcon />
            </IconButton>
          </CopyToClipboard>
          <IconButton onClick={props.requestClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <TextField
          fullWidth
          className={classes.addGraphicInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          variant="outlined"
        />
        <TextField
          fullWidth
          className={classes.addGraphicInput}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
        />
        <TextField
          fullWidth
          className={classes.addGraphicInput}
          placeholder="Password"
          value={password}
          helperText={errors.password}
          error={!!errors.password}
          InputProps={{
            onBlur: () => {
              const rules = pwdSchema.validate(password, { list: true });
              if (rules.length) {
                let error = '';
                switch (rules[0]) {
                  case 'min':
                    error = '8 characters minimum';
                    break;
                  case 'digits':
                    error = 'At least 1 digit';
                    break;
                  case 'symbols':
                    error = 'At least 1 symbol';
                    break;
                  case 'uppercase':
                    error = 'At least 1 uppercase letter';
                    break;
                  default:
                    error = '';
                }
                setErrors({
                  ...errors,
                  password: error,
                });
              }
            },
          }}
          type="password"
          variant="outlined"
          onChange={(e) => {
            if (errors.password)
              setErrors({
                ...errors,
                password: '',
              });
            setPassword(e.target.value);
          }}
        />
        <TextField
          fullWidth
          className={classes.addGraphicInput}
          placeholder="Phone"
          value={phone}
          helperText={errors.phone}
          error={!!errors.phone}
          InputProps={{
            onBlur: () => {
              if (/\s/.test(phone))
                setErrors({
                  ...errors,
                  phone: 'No space allowed',
                });
            },
          }}
          onChange={(e) => {
            if (errors.phone)
              setErrors({
                ...errors,
                phone: '',
              });

            setPhone(e.target.value);
          }}
          variant="outlined"
        />
        <Select
          variant="outlined"
          // size="small"
          fullWidth
          value={role}
          onChange={(e: any) => setRole(e.target.value)}
          className={classes.addGraphicInput}>
          <MenuItem value="Viewer">Viewer</MenuItem>
          <MenuItem value="Tester">Tester</MenuItem>
          <MenuItem value="Editor">Editor</MenuItem>
          <MenuItem value="Developer">Developer</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
        </Select>
        <Button
          fullWidth
          disabled={props.adding}
          size="large"
          variant="contained"
          color="primary"
          className={classes.addGraphicButton}
          onClick={handleAddUser}>
          Add
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const mapState = (state: RootState) => ({
  adding: state.loading.effects.user.addUser,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  addUser: dispatch.user.addUser,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(CreateUser);
