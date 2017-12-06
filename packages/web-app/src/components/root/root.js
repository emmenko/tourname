import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Application from '../application';
import AuthorizeCallback from '../authorize-callback';
import AuthorizeCallbackSilent from '../authorize-callback-silent';

const Root = () => (
  <Router>
    <Switch>
      <Route
        exact={true}
        path="/auth/callback/silent"
        component={AuthorizeCallbackSilent}
      />
      <Route exact={true} path="/auth/callback" component={AuthorizeCallback} />
      <Route component={Application} />
    </Switch>
  </Router>
);

export default Root;
