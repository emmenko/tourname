import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Application from './components/application';
import Callback from './components/callback';
import Login from './components/login';
import Logout from './components/logout';
// import registerServiceWorker from './registerServiceWorker';

const Root = () => (
  <Router>
    <Switch>
      <Route path="/auth/callback" render={Callback} />
      <Route path="/login" render={Login} />
      <Route path="/logout" render={Logout} />
      <Route component={Application} />
    </Switch>
  </Router>
);

ReactDOM.render(<Root />, document.getElementById('root'));
// registerServiceWorker();
