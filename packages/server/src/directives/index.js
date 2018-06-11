const IsAuthenticatedDirective = require('./is-authenticated');

module.exports = {
  // Checks that the request has a valid JWT auth token.
  // Optionally requires a Role. If a Role is required, the parsed auth0Id
  // should have access to the given organization with the specified Role.
  isAuthenticated: IsAuthenticatedDirective,
};
