open ReasonReactRouterDom;

module RouterMatch =
  SpecifyRouterMatch({
    type params = {
      .
      "organizationKey": string,
      "tournamentId": string,
    };
  });

module TournamentDetailQuery = [%graphql
  {|
  query TournamentDetail($id: String!) {
    tournament(id: $id) {
      id
      createdAt
      updatedAt
      name
      size
      status
      discipline
      teamSize
      teams {
        id
        size
        playerRefs {
          id
        }
      }
    }
  }
|}
];

module FetchTournamentDetail =
  ReasonApollo.CreateQuery(TournamentDetailQuery);

let component = ReasonReact.statelessComponent("TournamentDetail");

let make = (~match: RouterMatch.match, _children) => {
  ...component,
  render: _self => {
    let tournamentDetailQuery =
      TournamentDetailQuery.make(~id=match##params##tournamentId, ());
    <FetchTournamentDetail variables=tournamentDetailQuery##variables>
      ...(
           ({result}) =>
             switch (result) {
             | Loading => <LoadingSpinner />
             | Error(error) =>
               <NetworkErrorMessage error=error##networkError />
             | Data(response) =>
               <div>
                 <Breadcrumbs separator="//">
                   <Breadcrumb linkTo=("/" ++ match##params##organizationKey)>
                     (match##params##organizationKey |> ReasonReact.string)
                   </Breadcrumb>
                   <Breadcrumb>
                     ("Tournament" |> ReasonReact.string)
                   </Breadcrumb>
                 </Breadcrumbs>
                 <p>
                   (
                     "Name: "
                     ++ response##tournament##name
                     |> ReasonReact.string
                   )
                 </p>
                 <p>
                   (
                     "Status: "
                     ++ TournameTypes.tournamentStatusToJs(
                          response##tournament##status,
                        )
                     |> ReasonReact.string
                   )
                 </p>
                 <p>
                   (
                     "Discipline: "
                     ++ TournameTypes.disciplineToJs(
                          response##tournament##discipline,
                        )
                     |> ReasonReact.string
                   )
                 </p>
                 <p>
                   (
                     "Max players for each time: "
                     ++ string_of_int(response##tournament##teamSize)
                     |> ReasonReact.string
                   )
                 </p>
                 (
                   switch (response##tournament##status) {
                   | `New => ReasonReact.string("Add players form")
                   | _ => ReasonReact.null
                   }
                 )
               </div>
             }
         )
    </FetchTournamentDetail>;
  },
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );