import React from 'react';
import auth from '../../auth';

class AuthorizeCallbackSilent extends React.Component {
  componentDidMount() {
    auth.parseHash((error, authResult) => {
      window.parent.postMessage(error || authResult, 'http://localhost:3000/');
    });
  }
  render() {
    return null;
  }
}

export default AuthorizeCallbackSilent;
