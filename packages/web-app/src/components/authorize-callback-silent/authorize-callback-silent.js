import React from 'react';
import auth from '../../auth';
import { APP_CONFIG } from '../../config';

class AuthorizeCallbackSilent extends React.Component {
  componentDidMount() {
    auth.parseHash((error, authResult) => {
      window.parent.postMessage(error || authResult, APP_CONFIG.url);
    });
  }
  render() {
    return null;
  }
}

export default AuthorizeCallbackSilent;
