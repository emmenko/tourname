open ReasonReactRouterDom;

module RouterMatch =
  SpecifyRouterMatch({
    type params = {
      .
      "organizationKey": string,
      "tournamentId": string,
    };
  });

let component = ReasonReact.statelessComponent("TournamentDetail");

let make = (~match: RouterMatch.match, _children) => {
  ...component,
  render: _self => {
    let tournamentDetailQuery =
      FetchTournament.FetchTournamentQuery.make(
        ~id=match##params##tournamentId,
        ~organizationKey=match##params##organizationKey,
        (),
      );
    <FetchTournament variables=tournamentDetailQuery##variables>
      ...(
           ({result}) =>
             switch (result) {
             | Loading => <LoadingSpinner />
             | Error(error) =>
               <NetworkErrorMessage error=error##networkError />
             | Data(response) =>
               let tournament = response##tournament;
               <div>
                 <Breadcrumbs separator="//">
                   <Breadcrumb linkTo=("/" ++ match##params##organizationKey)>
                     (match##params##organizationKey |> ReasonReact.string)
                   </Breadcrumb>
                   <Breadcrumb>
                     ("Tournament" |> ReasonReact.string)
                   </Breadcrumb>
                 </Breadcrumbs>
                 <p> ("Name: " ++ tournament.name |> ReasonReact.string) </p>
                 <p>
                   (
                     "Status: "
                     ++ TournameTypes.tournamentStatusToJs(tournament.status)
                     |> ReasonReact.string
                   )
                 </p>
                 <p>
                   (
                     "Discipline: "
                     ++ TournameTypes.disciplineToJs(tournament.discipline)
                     |> ReasonReact.string
                   )
                 </p>
                 <p>
                   (
                     "Max players for each time: "
                     ++ string_of_int(tournament.teamSize)
                     |> ReasonReact.string
                   )
                 </p>
                 (
                   switch (tournament.status) {
                   | `New =>
                     <TournamentDetailAddPlayersForm
                       tournamentId=tournament.id
                       teamSize=tournament.teamSize
                       teams=tournament.teams
                       organizationKey=match##params##organizationKey
                       registeredPlayerIds=(
                         tournament.teams
                         |> List.map((team: FetchTournament.team) =>
                              team.playerRefs
                            )
                         |> List.flatten
                         |> List.map((playerRef: FetchTournament.playerRef) =>
                              playerRef.id
                            )
                       )
                     />
                   | _ => ReasonReact.null
                   }
                 )
               </div>;
             }
         )
    </FetchTournament>;
  },
};

let reactClass =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );