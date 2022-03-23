import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Amplify from 'aws-amplify';
import { Authenticator } from 'aws-amplify-react';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import './index.css';
import './i18n';
import awsconfig from './aws-config';
import { store } from './redux';
import logger from './utils/logger';
import Router from './nav/Router';
import Beta from './components/Beta';
import Toast from './components/Toast';

Amplify.configure(awsconfig);

const theme = createTheme({
  typography: {
    fontFamily: 'Rubik, sans-serif',
  },
  palette: {
    primary: {
      main: '#ffae63',
    },
    secondary: {
      main: '#023f37',
    },
  },
});

const Root = () => (
  <Provider store={store}>
    <React.Suspense fallback={null}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <Authenticator hideDefault>
              <Router />
            </Authenticator>
            <Beta />
          </MuiPickersUtilsProvider>
        </SnackbarProvider>
        <Toast />
      </ThemeProvider>
    </React.Suspense>
  </Provider>
);

store.dispatch.auth
  .boot()
  .catch((error) => {
    logger.debug('User has not been found');
    logger.debug('Clearing storage');
    window.sessionStorage.removeItem('token');
    console.error('Error:', error.message || error);
  })
  .finally(() => {
    ReactDOM.render(<Root />, document.getElementById('root'));
    store.dispatch.auth.fetchUserData();
  });
