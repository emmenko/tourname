module Auth = {
  type t;
  type authorizeOptions = {. "prompt": string};
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
  [@bs.obj]
  external makeAuthorizeOptions :
    (~prompt: [@bs.string] [ | [@bs.as "none"] `none], unit) =>
    authorizeOptions =
    "";
};

[@bs.module "../../auth"] [@bs.scope "default"]
external authorize : Js.Nullable.t(Auth.authorizeOptions) => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external parseHash : Auth.cb => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external getAccessToken : unit => string = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external getIsAccessTokenValid : unit => bool = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external hasLoginCredentials : unit => bool = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external logout : unit => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external renewSession : unit => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external storeSession : Auth.callbackAuthResult => unit = "";

[@bs.module "../../auth"] [@bs.scope "default"]
external scheduleSessionRenewal : unit => unit = "";