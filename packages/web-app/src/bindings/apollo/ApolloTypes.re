include ReasonApolloTypes;

/**
 * An abstract type to describe an Apollo Link object.
 */
type apolloLink;

/**
 * An abstract type to describe an Apollo Cache object.
 */
type apolloCache;

/**
 * Describe the options needed to construct an ApolloClient object.
 */
type clientOptions = {
  .
  "cache": apolloCache,
  "link": apolloLink
};