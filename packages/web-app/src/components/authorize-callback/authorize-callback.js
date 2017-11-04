import React from 'react';
import PropTypes from 'prop-types';
import auth from '../../auth';

class AuthorizeCallback extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
  };
  state = {
    errorMessage: null,
  };
  componentDidMount() {
    auth.parseHash((error, authResult) => {
      if (!error && !authResult) {
        this.setState({
          errorMessage:
            'This route has been called without any hash parameter. Please ensure that this route is called by Auth0 for handling authentication requests.',
        });
      } else if (authResult && authResult.accessToken && authResult.idToken) {
        auth.storeSession(authResult);
        auth.scheduleSessionRenewal();
        // Redirect to main page
        this.props.history.replace('/');
      } else if (error) {
        console.error(error);
        this.setState({
          errorMessage: (
            <div>
              <p>{error.errorDescription}</p>
              <p>
                <span>{'Please '}</span>
                <a onClick={() => auth.authorize()}>{'Log in'}</a>
                <span>{' again'}</span>
              </p>
            </div>
          ),
        });
      }
    });
  }
  render() {
    return (
      <div>
        {this.state.errorMessage ? (
          <div>{this.state.errorMessage}</div>
        ) : (
          <div>{'Loading'}</div>
        )}
      </div>
    );
  }
}

export default AuthorizeCallback;
