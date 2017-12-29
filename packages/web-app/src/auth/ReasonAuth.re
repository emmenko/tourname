type callbackError = {. "errorDescription": string};

type callbackAuthResult = {
  .
  "accessToken": string,
  "idToken": string
};

type authShape = {
  .
  "authorize": [@bs.meth] (unit => unit),
  "getAccessToken": [@bs.meth] (unit => string),
  "logout": [@bs.meth] (unit => unit),
  "parseHash":
    [@bs.meth]
    (
      (
        (Js.Nullable.t(callbackError), Js.Nullable.t(callbackAuthResult)) =>
        unit
      ) =>
      unit
    ),
  "storeSession": [@bs.meth] (callbackAuthResult => unit),
  "scheduleSessionRenewal": [@bs.meth] (unit => unit)
};