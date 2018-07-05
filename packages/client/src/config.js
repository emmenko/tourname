const config = {
  appUrl: process.env.APP_URL,
  apiUrl: process.env.API_URL,
  authDomain: 'tourname.eu.auth0.com',
  authClientId: process.env.AUTH_CLIENT_ID,
  authCallbackUrl: process.env.AUTH_CALLBACK_URL,
  authApiUrl: 'https://tourname.eu.auth0.com/api/v2/',
};

export default config;
