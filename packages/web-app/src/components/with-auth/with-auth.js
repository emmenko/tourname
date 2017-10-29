import { withProps } from 'recompose';
import { WebAuth } from 'auth0-js';
import { AUTH_CONFIG } from '../../config';

const requestedScopes = 'openid profile email';

const webAuth0 = new WebAuth({
  domain: AUTH_CONFIG.domain,
  clientID: AUTH_CONFIG.clientId,
  redirectUri: AUTH_CONFIG.callbackUrl,
  audience: AUTH_CONFIG.apiUrl,
  responseType: 'token id_token',
  scope: requestedScopes,
});

const storeSession = authResult => {
  // Set the time that the access token will expire at
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );

  // TODO: move it into storage util
  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
};

const getIsAuthenticated = () => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return false;

  const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
  const isTokenValid = new Date().getTime() < expiresAt;

  if (!isTokenValid) {
    console.log('Session expired');
    clearSession();
  }
  return isTokenValid;
};

const withAuth = withProps(() => ({
  authorize: webAuth0.authorize.bind(webAuth0),
  parseHash: webAuth0.parseHash.bind(webAuth0),
  isAuthenticated: getIsAuthenticated(),
  storeSession,
  clearSession,
}));

export default withAuth;
