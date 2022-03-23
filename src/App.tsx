import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';

import { RootState } from './redux';
import { RootModel } from './redux/models';
import { setAuthenticationErrorListener } from './services/api/axios';
import AppBar from './components/AppBar';
import AppRouter from './nav/AppRouter';

const useStyles = makeStyles({
  app: {
    width: '100vw',
    height: '100vh',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  appBody: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
  },
});

interface Props extends StateProps, DispatchProps {
  onStateChange?(state: string): void;
}

const App: React.FC<Props> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { i18n } = useTranslation();

  const { logout, onStateChange } = props;

  useEffect(() => {
    i18n.changeLanguage(props.user?.attributes.locale);
  }, [i18n, props.user]);

  useEffect(() => {
    if (history) {
      setAuthenticationErrorListener(() =>
        logout().then(() => onStateChange?.('signIn'))
      );
    }
    return () => setAuthenticationErrorListener(null);
  }, [history, logout, onStateChange]);

  return (
    <div className={classes.app}>
      <AppBar onStateChange={onStateChange} />
      <div className={classes.appBody}>
        <AppRouter />
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  logout: dispatch.auth.logout,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(App);
