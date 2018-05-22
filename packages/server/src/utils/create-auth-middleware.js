const mergeAuthHeader = (token, req) =>
  Object.assign({}, req, {
    headers: Object.assign({}, req.headers, {
      Authorization: `Bearer ${token}`,
    }),
  });

const calculateExpirationTime = expiresIn =>
  Date.now() +
  expiresIn * 1000 -
  // Add a gap of 1 hour before expiration time.
  1 * 60 * 60 * 1000;

const createAuthMiddleware = options => {
  let tokenCache = {};
  let pendingTasks = [];
  let isFetching = false;

  return next => async (request, response) => {
    // Check if there is already a `Authorization` header in the request.
    // If so, then go directly to the next middleware.
    if (
      (request.headers && request.headers.authorization) ||
      (request.headers && request.headers.Authorization)
    ) {
      next(request, response);
      return;
    }

    // If there was a token in the tokenCache, and it's not expired, append
    // the token in the `Authorization` header.
    if (
      tokenCache &&
      tokenCache.token &&
      Date.now() < tokenCache.expirationTime
    ) {
      const requestWithAuth = mergeAuthHeader(tokenCache.token, request);
      next(requestWithAuth, response);
      return;
    }

    // Keep pending tasks until a token is fetched
    pendingTasks.push({ request, response });

    // If a token is currently being fetched, just wait ;)
    if (isFetching) return;

    // Mark that a token is being fetched
    isFetching = true;

    try {
      const authResponse = await fetch(`${options.host}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: options.clientId,
          client_secret: options.clientSecret,
          audience: `${options.host}/api/v2/`,
        }),
      });

      if (authResponse.ok) {
        const {
          access_token: token,
          expires_in: expiresIn,
        } = await authResponse.json();
        const expirationTime = calculateExpirationTime(expiresIn);
        // Cache new token
        tokenCache = { token, expirationTime };

        // Dispatch all pending requests
        isFetching = false;

        // Freeze and copy pending queue, reset original one for accepting
        // new pending tasks
        const executionQueue = pendingTasks.slice();
        // eslint-disable-next-line no-param-reassign
        pendingTasks = [];
        executionQueue.forEach(task => {
          // Assign the new token in the request header
          const requestWithAuth = mergeAuthHeader(token, task.request);
          next(requestWithAuth, task.response);
        });
      } else {
        // Handle error response
        const responseText = await authResponse.text();
        let parsed;
        try {
          parsed = JSON.parse(responseText);
        } catch (error) {
          /* noop */
        }
        const error = new Error(parsed ? parsed.message : responseText);
        if (parsed) error.body = parsed;
        response.reject(error);
      }
    } catch (error) {
      response.reject(error);
    }
  };
};

module.exports = createAuthMiddleware;
