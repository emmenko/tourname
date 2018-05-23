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
    switch (action) {
    | AuthError(errorType_) =>
      ReasonReact.Update({errorType: Some(errorType_)})
    },
  didMount: self => {
    ReasonAuth.parseHash((~error as error_, ~authResult as authResult_) => {
      let error = Js.Nullable.to_opt(error_);
      let authResult = Js.Nullable.to_opt(authResult_);
      switch (error, authResult) {
      | (None, None) =>
        self.send(AuthError(NoHashParam));
        ();
      | (_, Some(r)) =>
        /* NOTE: we assume that following fields are defined:
           - authResult##accessToken
           - authResult##idToken */
        ReasonAuth.storeSession(r);
        ReasonAuth.scheduleSessionRenewal();
        /* Redirect to main page */
        history##replace("/");
        ();
      | (Some(e), _) =>
        Js.log(e);
        self.send(AuthError(General(e##errorDescription)));
        ();
      };
    });
    ();
  },
  render: self =>
    <div>
      (
        switch (self.state.errorType) {
        | Some(type_) =>
          switch (type_) {
          | NoHashParam =>
            "This route has been called without any hash parameter. Please ensure that this route is called by Auth0 for handling authentication requests."
            |> ReasonReact.string
          | General(description) =>
            <div>
              <p> (description |> ReasonReact.string) </p>
              <p>
                <span> ("Please " |> ReasonReact.string) </span>
                <a
                  onClick=(
                    _event =>
                      ReasonAuth.authorize(Js_null_undefined.undefined)
                  )>
                  ("Log in" |> ReasonReact.string)
                </a>
                <span> (" again" |> ReasonReact.string) </span>
              </p>
            </div>
          }
        | None => "Loading" |> ReasonReact.string
        }
      )
    </div>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~history=jsProps##history, [||])
  );