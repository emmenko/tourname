open ReasonReactRouterDom;

module ApolloProvider = {
  [@bs.module "react-apollo"]
  external reactClass : ReasonReact.reactClass = "ApolloProvider";
  let make = (~client: ApolloClient.generatedApolloClient, children) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={"client": client},
      children
    );
};

let component = ReasonReact.statelessComponent("Application");

let make = (~location: History.History.Location.t, _children) => {
  ...component,
  didMount: _self => {
    if (ReasonAuth.getIsAccessTokenValid()) {
      ReasonAuth.scheduleSessionRenewal();
    } else if (ReasonAuth.hasLoginCredentials()) {
      ReasonAuth.authorize(
        Js_null_undefined.return(
          ReasonAuth.Auth.makeAuthorizeOptions(~prompt=`none, ())
        )
      );
    };
    ReasonReact.NoUpdate;
  },
  render: _self =>
    if (ReasonAuth.getIsAccessTokenValid()) {
      <ApolloProvider client=ConfigureApollo.Client.apolloClient>
        <ApplicationAuthenticated />
      </ApolloProvider>;
    } else if (History.History.Location.pathname(location) != "/") {
      <Redirect to_="/" />;
    } else {
      <ApplicationLandingPage />;
    }
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~location=jsProps##location, [||])
  );