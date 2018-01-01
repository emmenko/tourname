import React from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import apolloClient from '../../bindings/apollo';
import auth from '../../auth';
import ApplicationAuthenticated from '../application-authenticated';
import ApplicationLandingPage from '../application-landing-page';

class Application extends React.PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    if (auth.getIsAccessTokenValid()) {
      auth.scheduleSessionRenewal();
    } else if (auth.hasLoginCredentials()) {
      // Attempt a silent authentication
      auth.authorize({ prompt: 'none' });
    }
  }

  render() {
    if (auth.getIsAccessTokenValid())
      return (
        <ApolloProvider client={apolloClient}>
          <ApplicationAuthenticated {...this.props} />
        </ApolloProvider>
      );
    if (this.props.location.pathname !== '/') return <Redirect to="/" />;
    return <ApplicationLandingPage />;
  }
}

export default Application;
