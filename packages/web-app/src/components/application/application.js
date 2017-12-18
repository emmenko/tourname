import React from 'react';
import PropTypes from 'prop-types';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloProvider } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import { GRAPHQL_CONFIG } from '../../config';
import auth from '../../auth';
import ApplicationAuthenticated from '../application-authenticated';
import ApplicationLandingPage from '../application-landing-page';

const httpLink = createHttpLink({ uri: GRAPHQL_CONFIG.url });
const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: `Bearer ${auth.getAccessToken()}`,
    },
  });
  return forward(operation);
});
const errorLink = onError(({ networkError }) => {
  if (networkError && networkError.statusCode === 401) {
    auth.logout();
  }
});
const client = new ApolloClient({
  cache: new InMemoryCache({
    dataIdFromObject: object => {
      switch (object.__typename) {
        case 'Organization':
          return object.key; // use `key` as the primary key
        default:
          return object.id;
      }
    },
  }),
  link: ApolloLink.from([middlewareLink, errorLink, httpLink]),
});

class Application extends React.PureComponent {
  static propTypes = {
    // isAuthenticated: PropTypes.bool.isRequired,
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
        <ApolloProvider client={client}>
          <ApplicationAuthenticated {...this.props} />
        </ApolloProvider>
      );
    if (this.props.location.pathname !== '/') return <Redirect to="/" />;
    return <ApplicationLandingPage />;
  }
}

export default Application;
