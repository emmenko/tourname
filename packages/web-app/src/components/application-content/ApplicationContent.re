open ReasonReactRouterDom;

[@bs.module "../tournaments-list"]
external tournamentsList : ReasonReact.reactClass = "default";

[@bs.module "../tournament-detail"]
external tournamentDetail : ReasonReact.reactClass = "default";

module NotFound = {
  let component = ReasonReact.statelessComponent("NotFound");
  let make = _children => {
    ...component,
    render: _self =>
      <div> (ReasonReact.stringToElement("404 Not Found")) </div>,
  };
};

[@bs.scope "localStorage"] [@bs.val]
external setItem : (string, string) => unit = "";

module RouterMatch =
  SpecifyRouterMatch(
    {
      type params = {. "organizationKey": string};
    },
  );

let component = ReasonReact.statelessComponent("ApplicationContent");

let make = (~match: RouterMatch.match, _children) => {
  let organizationKey = match##params##organizationKey;
  {
    ...component,
    render: _self => {
      let organizationQuery =
        FetchOrganization.OrganizationQuery.make(~key=organizationKey, ());
      <FetchOrganization variables=organizationQuery##variables>
        ...(
             ({result}) =>
               switch (result) {
               | Loading => ReasonReact.stringToElement("Loading...")
               | Error(_error) => <NotFound />
               | Data(_response) =>
                 <div>
                   <Route
                     path="/:organizationKey"
                     render=(
                       _renderFunc => {
                         setItem("organizationKey", organizationKey);
                         ReasonReact.nullElement;
                       }
                     )
                   />
                   <Switch>
                     <Route
                       exact=true
                       path="/:organizationKey"
                       component=Dashboard.default
                     />
                     <Route
                       exact=true
                       path="/:organizationKey/tournaments"
                       component=tournamentsList
                     />
                     <Route
                       exact=true
                       path="/:organizationKey/tournament/:tournamentId"
                       component=tournamentDetail
                     />
                   </Switch>
                 </div>
               }
           )
      </FetchOrganization>;
    },
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );