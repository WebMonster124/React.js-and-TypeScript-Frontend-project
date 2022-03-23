import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { parse } from 'query-string';

import App from '../App';
import SignIn from '../pages/SignIn';
import ConfirmSignin from '../pages/ConfirmPassword';
import ChangePassword from '../pages/ChangePassword';

interface Props {
  authState?: string;
  onStateChange?(state: string): void;
}

const Router: React.FC<Props> = ({ authState, ...props }) => (
  <BrowserRouter>
    <Switch>
      <Route path="/confirm-signin">
        {authState === 'confirmSignIn' ? (
          <ConfirmSignin />
        ) : (
          <Redirect to={`/${window.location.search}`} />
        )}
      </Route>
      <Route path="/change-password">
        {authState === 'requireNewPassword' ? (
          <ChangePassword />
        ) : (
          <Redirect to={`/${window.location.search}`} />
        )}
      </Route>
      <Route
        path={[
          '/dashboard',
          '/app',
          '/edit',
          '/users',
          '/feedback',
          '/monitor',
        ]}
        render={({ location: { pathname } }) =>
          authState === 'signedIn' ? (
            <App {...props} />
          ) : (
            <Redirect to={`/?ret=${encodeURIComponent(pathname)}`} />
          )
        }
      />
      <Route
        exact
        path="/"
        render={() => {
          // this redirect to whatever is present on the ret query string after signed in
          const queryParams = parse(window.location.search);
          let redirect = queryParams.ret?.toString() || '/dashboard';
          if (authState === 'requireNewPassword')
            redirect = `/change-password?ret=${encodeURIComponent(redirect)}`;
          else if (authState === 'confirmSignIn')
            redirect = `/confirm-signin?ret=${encodeURIComponent(redirect)}`;
          return authState === 'signedIn' ||
            authState === 'requireNewPassword' ||
            authState === 'confirmSignIn' ? (
            <Redirect to={redirect} />
          ) : (
            <SignIn {...props} />
          );
        }}
      />
    </Switch>
  </BrowserRouter>
);

export default Router;
