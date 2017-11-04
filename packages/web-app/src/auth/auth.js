import { WebAuth } from 'auth0-js';
import { APP_CONFIG, AUTH_CONFIG } from '../config';

const STORAGE_KEY_ACCESS_TOKEN = 'tourname:access_token';
const STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT = 'tourname:access_token_expires_at';
const STORAGE_KEY_ID_TOKEN = 'tourname:id_token';

const auth0Options = {
  domain: AUTH_CONFIG.domain,
  clientID: AUTH_CONFIG.clientId,
  redirectUri: AUTH_CONFIG.callbackUrl,
  audience: AUTH_CONFIG.apiUrl,
  responseType: 'token id_token',
  scope: 'openid profile email',
};

class Auth {
  webAuth0 = new WebAuth(auth0Options);
  tokenRenewalTimeout = null;

  authorize = (...args) => this.webAuth0.authorize(...args);

  parseHash = (...args) => this.webAuth0.parseHash(...args);

  logout = () => {
    // Clear session
    clearTimeout(this.tokenRenewalTimeout);
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_ID_TOKEN);
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT);

    // Logout from auth0
    this.webAuth0.logout({
      redirectTo: APP_CONFIG.url,
      clientID: AUTH_CONFIG.clientId,
    });
  };

  getAccessToken = () => localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);

  // This method is used to determine if the user has already some token
  // credentials in local storage. If so, we can attempt to perform a silent
  // authentication in case the token is expired. If not, we render the landing page.
  // NOTE: we might find a better solution for that.
  hasLoginCredentials = () =>
    Boolean(
      localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN) ||
        localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT) ||
        localStorage.getItem(STORAGE_KEY_ID_TOKEN)
    );

  getIsAccessTokenValid = () => {
    const accessToken = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
    if (!accessToken) return false;
    const expiresAt = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT)
    );
    const isTokenValid = Date.now() < expiresAt;
    return isTokenValid;
  };

  storeSession = authResult => {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    // TODO: move it into storage util
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, authResult.accessToken);
    localStorage.setItem(STORAGE_KEY_ID_TOKEN, authResult.idToken);
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT, expiresAt);
  };

  renewSession = () => {
    console.warn('Attempting to renew token');
    this.webAuth0.renewAuth(
      {
        audience: AUTH_CONFIG.apiUrl,
        redirectUri: `${AUTH_CONFIG.callbackUrl}/silent`,
        usePostMessage: true,
      },
      (error, authResult) => {
        if (error) {
          console.error('Could not renew token', error);
        } else {
          this.storeSession(authResult);
          this.scheduleSessionRenewal();
        }
      }
    );
  };

  scheduleSessionRenewal = () => {
    const expiresAt = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT)
    );
    if (!expiresAt) return;
    const delayOffset = 10 * 60 * 1000; // 10min
    const delay = expiresAt - Date.now() - delayOffset;
    if (delay > 0) {
      clearTimeout(this.tokenRenewalTimeout);
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewSession();
      }, delay);
    }
  };
}

export default new Auth();
