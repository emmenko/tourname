[@bs.module "../../auth"] external auth : ReasonAuth.authShape = "default";

type callbackErrorTypes =
  | NoHashParam
  | General(string);

type state = {errorType: option(callbackErrorTypes)};

type action =
  | AuthError(callbackErrorTypes);

type history = {. "replace": [@bs.meth] (string => unit)};

let component = ReasonReact.reducerComponent("AuthorizeCallback");

let make = (~history: history, _children) => {
  ...component,
  initialState: () => {errorType: None},
  reducer: (action, _state) =>
    switch action {
    | AuthError(errorType_) =>
      ReasonReact.Update({errorType: Some(errorType_)})
    },
  didMount: self => {
    auth##parseHash(
      (
        error_: Js.Nullable.t(ReasonAuth.callbackError),
        authResult_: Js.Nullable.t(ReasonAuth.callbackAuthResult)
      ) => {
      let error = Js.Nullable.to_opt(error_);
      let authResult = Js.Nullable.to_opt(authResult_);
      switch (error, authResult) {
      | (None, None) =>
        self.reduce(() => AuthError(NoHashParam), ());
        ();
      | (_, Some(r)) =>
        /* NOTE: we assume that following fields are defined:
           - authResult##accessToken
           - authResult##idToken */
        auth##storeSession(r);
        auth##scheduleSessionRenewal();
        /* Redirect to main page */
        history##replace("/");
        ();
      | (Some(e), _) =>
        Js.log(e);
        self.reduce(() => AuthError(General(e##errorDescription)), ());
        ();
      };
    });
    ReasonReact.NoUpdate;
  },
  render: self =>
    <div>
      (
        switch self.state.errorType {
        | Some(type_) =>
          switch type_ {
          | NoHashParam =>
            ReasonReact.stringToElement(
              "This route has been called without any hash parameter. Please ensure that this route is called by Auth0 for handling authentication requests."
            )
          | General(description) =>
            <div>
              <p> (ReasonReact.stringToElement(description)) </p>
              <p>
                <span> (ReasonReact.stringToElement("Please ")) </span>
                <a onClick=(_event => auth##authorize())>
                  (ReasonReact.stringToElement("Log in"))
                </a>
                <span> (ReasonReact.stringToElement(" again")) </span>
              </p>
            </div>
          }
        | None => ReasonReact.stringToElement("Loading")
        }
      )
    </div>
};