open ReasonReactRouterDom;

[@bs.module "../organization-create"]
external organizationCreate : ReasonReact.reactClass = "default";

[@bs.module "../select-new-tournament"]
external selectNewTournament : ReasonReact.reactClass = "default";

[@bs.scope "localStorage"] [@bs.val] [@bs.return nullable]
external getItem : string => option(string) = "";

let component = ReasonReact.statelessComponent("ApplicationAuthenticated");

let make = _children => {
  ...component,
  render: _self =>
    <div>
      <FetchUser>
        (
          response =>
            switch response {
            | Loading => ReasonReact.stringToElement("Loading...")
            | Failed(error) =>
              Js.log(error);
              ReasonReact.nullElement;
            | Loaded(result) =>
              let shouldForceToCreateAnOrganization =
                Array.length(result##me##availableOrganizations) == 0;
              if (shouldForceToCreateAnOrganization) {
                <Redirect to_="/organizations/new" />;
              } else {
                <div>
                  <ApplicationBar isUserAuthenticated=true />
                  <Switch>
                    <Route
                      exact=true
                      path="/new"
                      component=selectNewTournament
                    />
                    <Route
                      exact=true
                      path="/organizations/new"
                      component=organizationCreate
                    />
                    <Route
                      exact=true
                      path="/"
                      render=(
                        _renderFunc => {
                          let cachedOrganizationKey =
                            getItem("organizationKey");
                          switch cachedOrganizationKey {
                          | Some(orgKey) => <Redirect to_={j|/$orgKey|j} />
                          | None => <SelectOrganization />
                          };
                        }
                      )
                    />
                    <Route
                      path="/:organizationKey"
                      component=ApplicationContent.default
                    />
                  </Switch>
                </div>;
              };
            }
        )
      </FetchUser>
    </div>
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));