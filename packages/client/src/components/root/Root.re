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
          component=AuthorizeCallbackSilent.reactClass
        />
        <Route
          exact=true
          path="/auth/callback"
          component=AuthorizeCallback.reactClass
        />
        <Route component=Application.reactClass />
      </Switch>
    </BrowserRouter>
};
