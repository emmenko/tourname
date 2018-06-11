open ReasonReactRouterDom;

let component = ReasonReact.statelessComponent("Application");

let make = (~location: History.History.Location.t, _children) => {
  ...component,
  didMount: _self => {
    if (ReasonAuth.getIsAccessTokenValid()) {
      ReasonAuth.scheduleSessionRenewal();
    } else if (ReasonAuth.hasLoginCredentials()) {
      ReasonAuth.authorize(
        Js_null_undefined.return(
          ReasonAuth.Auth.makeAuthorizeOptions(~prompt=`none, ()),
        ),
      );
    };
    ();
  },
  render: _self =>
    if (ReasonAuth.getIsAccessTokenValid()) {
      <ReasonApollo.Provider client=Client.instance>
        <ApplicationAuthenticated />
      </ReasonApollo.Provider>;
    } else if (History.History.Location.pathname(location) != "/") {
      <Redirect to_="/" />;
    } else {
      <ApplicationLandingPage />;
    },
};

let reactClass =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~location=jsProps##location, [||])
  );