import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Application from './components/application';
import AuthorizeCallback from './components/authorize-callback';
import AuthorizeCallbackSilent from './components/authorize-callback-silent';
// import registerServiceWorker from './registerServiceWorker';

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

ReactDOM.render(<Root />, document.getElementById('root'));
// registerServiceWorker();
