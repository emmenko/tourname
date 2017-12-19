import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { GRAPHQL_CONFIG } from './config';
import auth from './auth';

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

export default client;
