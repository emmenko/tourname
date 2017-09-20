import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import { Spinner } from 'belle';
import withAuth from '../with-auth';

class Callback extends React.Component {
  static propTypes = {
    parseHash: PropTypes.func.isRequired,
    storeSession: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };
  state = {
    errorMessage: null,
  };
  componentDidMount() {
    this.props.parseHash((error, authResult) => {
      if (!error && !authResult) {
        this.setState({
          errorMessage:
            'This route has been called without any hash parameter. Please ensure that this route is called by Auth0 for handling authentication requests.',
        });
      } else if (authResult && authResult.accessToken && authResult.idToken) {
        this.props.storeSession(authResult);
        // Redirect to main page
        this.props.history.replace('/');
      } else if (error) {
        this.setState({
          errorMessage: `${error.error}: ${error.errorDescription}`,
        });
      }
    });
  }
  render() {
    return (
      <div>
        {this.state.errorMessage ? (
          <p>{this.state.errorMessage}</p>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
}

export default compose(withRouter, withAuth)(Callback);
