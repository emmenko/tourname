import React from 'react';
import PropTypes from 'prop-types';
import ApolloClient from 'apollo-client';
import Cache from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloProvider } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import { GRAPHQL_CONFIG } from '../../config';
import withAuth from '../with-auth';
import ApplicationAuthenticated from '../application-authenticated';
import ApplicationLandingPage from '../application-landing-page';

const history = createHistory();

const httpLink = createHttpLink({ uri: GRAPHQL_CONFIG.url });
const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return forward(operation);
});
const errorLink = onError(({ networkError }) => {
  if (networkError.status === 401) {
    history.push('/logout?reason=unauthorized');
  }
});
const client = new ApolloClient({
  cache: new Cache(),
  link: ApolloLink.from([middlewareLink, errorLink, httpLink]),
});

const Application = props => {
  if (props.isAuthenticated)
    return (
      <ApolloProvider client={client}>
        <ApplicationAuthenticated {...props} />
      </ApolloProvider>
    );
  if (props.location.pathname !== '/') return <Redirect to="/" />;
  return <ApplicationLandingPage />;
};
Application.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withAuth(Application);
