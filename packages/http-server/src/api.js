const { createClient } = require('@commercetools/sdk-client');
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http');
const createAuthMiddleware = require('./utils/create-auth-middleware');

const authMiddleware = createAuthMiddleware({
  host: process.env.AUTH0_DOMAIN,
  clientId: process.env.API_CLIENT_ID,
  clientSecret: process.env.API_CLIENT_SECRET,
});
const httpMiddleware = createHttpMiddleware({
  host: `${process.env.AUTH0_DOMAIN}/api/v2`,
});
const httpClient = createClient({
  middlewares: [authMiddleware, httpMiddleware],
});

const AUTH0_USER_FIELDS = 'user_id,email,name,picture,created_at,updated_at';

const fetchUser = query =>
  httpClient
    .execute({
      uri: `/users?include_fields=true&fields=${encodeURIComponent(
        AUTH0_USER_FIELDS
      )}&q=${query}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.body);

module.exports = {
  fetchUser,
};
