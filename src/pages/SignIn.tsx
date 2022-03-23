import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import PWDV from 'password-validator';
import queryString from 'query-string';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useTranslation } from 'react-i18next';

import { RootState } from '../redux';
import { RootModel } from '../redux/models';
import imgLogo from '../assets/logo-v1.png';
import imgBackground from '../assets/login-bg.jpg';
import Button from '../components/Button';
import logger from '../utils/logger';

const pwdSchema = new PWDV();
pwdSchema.is().min(8).has().uppercase().has().digits().has().symbols();

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
  },
  bg: {
    flex: 1,
    backgroundImage: `url('${imgBackground}')`,
    backgroundSize: 'cover',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 22,
    width: 168,
  },
  title: {
    width: 380,
    marginBottom: 48,
    fontSize: 41,
    color: 'black',
    textAlign: 'center',
    fontFamily: '"Playfair Display", serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 470,
    width: 'calc(100% - 2rem)',
  },
  submit: {
    marginTop: 18,
    marginBottom: 24,
  },
});

interface Props extends StateProps, DispatchProps {
  onStateChange?(state: string): void;
}

const SignIn: React.FC<Props> = ({ login, loading, onStateChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = useCallback(
    (e?: any) => {
      logger.info('Auth/Login/Login-Handler');
      if (e) e.preventDefault();
      logger.debug('Calling redux auth effect');
      login({ email, password })
        .then((next) => {
          logger.debug('Switching to the next state', { state: next });
          onStateChange?.(next);
        })
        .catch((err) => {
          logger.error('Login Request failed', err);
          enqueueSnackbar(err.message || 'Request Failed', {
            variant: 'error',
          });
        });
    },
    [email, password, enqueueSnackbar, login, onStateChange]
  );

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    if (query.email) {
      setEmail(query.email.toString());
    }
    if (query.password) {
      setPassword(query.password.toString());
    }
    if (query.autoLogin) {
      setAutoLogin(true);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (autoLogin && email && password) {
        handleLogin();
      }
    }, 0);
  }, [autoLogin, email, password, handleLogin]);

  return (
    <main className={classes.root}>
      <div className={classes.bg} />
      <div className={classes.main}>
        <img src={imgLogo} alt="Logo" className={classes.logo} />
        <Typography className={classes.title} component="h1">
          {t('signin.header')}
        </Typography>
        <form
          method="POST"
          onSubmit={handleLogin}
          className={classes.form}
          noValidate>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('signin.email')}
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            error={!!passwordValidation}
            helperText={passwordValidation}
            InputProps={{
              onBlur: () => {
                const rules = pwdSchema.validate(password, { list: true });
                if (rules.length) {
                  let error = '';
                  switch (rules[0]) {
                    case 'min':
                      error = t('signin.8_characters_minimum');
                      break;
                    case 'digits':
                      error = t('signin.at_least_1_digit');
                      break;
                    case 'symbols':
                      error = t('signin.at_least_1_symbol');
                      break;
                    case 'uppercase':
                      error = t('signin.at_least_1_uppercase');
                      break;
                    default:
                      error = '';
                  }
                  setPasswordValidation(error);
                }
              },
            }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordValidation('');
            }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('signin.password')}
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            fullWidth
            className={classes.submit}>
            {t('signin.sign_in')}
          </Button>
        </form>
      </div>
    </main>
  );
};

const mapState = (state: RootState) => ({
  loading: state.loading.effects.auth.login,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  login: dispatch.auth.login,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(SignIn);
