open ReasonReactRouterDom;

[@bs.scope "localStorage"] [@bs.val] [@bs.return nullable]
external getItem : string => option(string) = "";

let component = ReasonReact.statelessComponent("ApplicationAuthenticated");

let make = _children => {
  ...component,
  render: _self =>
    <div>
      <FetchUser>
        ...(
             ({result}) =>
               switch (result) {
               | Loading => "Loading..." |> ReasonReact.string
               | Error(error) =>
                 Js.log(error);
                 ReasonReact.null;
               | Data(response) =>
                 let shouldForceToCreateAnOrganization =
                   Array.length(response##me##availableOrganizations) == 0;
                 <div>
                   <ApplicationBar.Authenticated
                     showActionsMenu=(! shouldForceToCreateAnOrganization)
                   />
                   <Switch>
                     <Route
                       exact=true
                       path="/new"
                       component=SelectNewTournament.reactClass
                     />
                     <Route
                       exact=true
                       path="/organizations/new"
                       component=OrganizationCreate.reactClass
                     />
                     <Route
                       render=(
                         _renderProps =>
                           if (shouldForceToCreateAnOrganization) {
                             <Redirect to_="/organizations/new" />;
                           } else {
                             <Switch>
                               <Route
                                 exact=true
                                 path="/"
                                 render=(
                                   _renderFunc => {
                                     let cachedOrganizationKey =
                                       getItem("organizationKey");
                                     switch (cachedOrganizationKey) {
                                     | Some(orgKey) =>
                                       <Redirect to_={j|/$orgKey|j} />
                                     | None => <SelectOrganization />
                                     };
                                   }
                                 )
                               />
                               <Route
                                 path="/:organizationKey"
                                 component=ApplicationContent.reactClass
                               />
                             </Switch>;
                           }
                       )
                     />
                   </Switch>
                 </div>;
               }
           )
      </FetchUser>
    </div>,
};