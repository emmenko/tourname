const IsAuthenticatedDirective = require('./is-authenticated');
const IsAdminDirective = require('./is-admin');

module.exports = {
  isAuthenticated: IsAuthenticatedDirective,
  isAdmin: IsAdminDirective,
};
