type appConfig = {. "url": string};

[@bs.module "../../config.js"] external config : appConfig = "APP_CONFIG";

[@bs.scope ("window", "parent")] [@bs.val]
external postMessage : ('a, string) => unit = "postMessage";

let component = ReasonReact.statelessComponent("AuthorizeCallbackSilent");

let make = _children => {
  ...component,
  didMount: _self => {
    ReasonAuth.parseHash((~error as error_, ~authResult as authResult_) => {
      let error = Js.Nullable.toOption(error_);
      let authResult = Js.Nullable.toOption(authResult_);
      switch (error, authResult) {
      | (None, None) =>
        postMessage(Js_null_undefined.undefined, config##url);
        ();
      | (Some(e), _) => postMessage(e, config##url)
      | (_, Some(r)) => postMessage(r, config##url)
      };
    });
    ();
  },
  render: _self => ReasonReact.null,
};

let reactClass = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));