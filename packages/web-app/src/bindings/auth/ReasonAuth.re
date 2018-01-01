module Auth = {
  type t;
  type callbackError = {. "errorDescription": string};
  type callbackAuthResult = {
    .
    "accessToken": string,
    "idToken": string
  };
  type cb =
    (
      ~error: Js.Nullable.t(callbackError),
      ~authResult: Js.Nullable.t(callbackAuthResult)
    ) =>
    unit;
};

[@bs.module "../../auth"] [@bs.scope "default"]
external authorize : unit => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external getAccessToken : unit => string = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external logout : unit => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external parseHash : Auth.cb => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external storeSession : Auth.callbackAuthResult => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external scheduleSessionRenewal : unit => unit = "";