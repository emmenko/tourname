open ReasonReactRouterDom;

let component = ReasonReact.statelessComponent("Root");

let make = _children => {
  ...component,
  render: _self =>
    <BrowserRouter>
      <Switch>
        <Route
          exact=true
          path="/auth/callback/silent"
          component=AuthorizeCallbackSilent.default
        />
        <Route
          exact=true
          path="/auth/callback"
          component=AuthorizeCallback.default
        />
        <Route component=Application.default />
      </Switch>
    </BrowserRouter>
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));