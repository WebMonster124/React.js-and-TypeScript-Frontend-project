import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import ManageUsers from '../pages/ManageUsers';
import Feedback from '../pages/Feedback';
import Monitor from '../pages/Monitor';
import GraphicTypeEditor from '../pages/GraphicTypeEditor';
import GraphicEditor from '../pages/GraphicEditor';

const AppRouter: React.FC = () => (
  <Switch>
    <Route
      exact
      path={[
        '/dashboard/:graphicTypeId/:graphicId',
        '/dashboard/:graphicTypeId/g/:graphicId',
        '/dashboard/:graphicTypeId/graphic/:graphicId',
      ]}
      render={(props) => <Dashboard {...props} />}
    />
    <Route
      exact
      path={['/dashboard/:graphicTypeId']}
      render={(props) => <Dashboard {...props} />}
    />
    <Route
      exact
      path={['/dashboard', '/app']}
      render={(props) => <Dashboard {...props} />}
    />
    <Route exact path={['/users', '/app/users']}>
      <ManageUsers />
    </Route>
    <Route exact path={['/feedback', '/app/feedback']}>
      <Feedback />
    </Route>
    <Route exact path={['/monitor', '/app/monitor']}>
      <Monitor />
    </Route>
    <Route
      path={[
        '/edit/:graphicTypeId/g/:graphicId',
        '/edit/:graphicTypeId/graphic/:graphicId',
        '/app/:graphicTypeId/graphic/:graphicId',
      ]}
      render={(props) => <GraphicEditor {...props} />}
    />
    <Route
      path={['/edit/:graphicTypeId', '/app/:graphicTypeId']}
      render={(props) => <GraphicTypeEditor {...props} />}
    />
  </Switch>
);

export default AppRouter;
