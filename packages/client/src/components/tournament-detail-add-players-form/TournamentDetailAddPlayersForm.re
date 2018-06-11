module Styles = {
  open TypedGlamor;
  let columns = css([display(flex), flexDirection(row)]);
  let column = css([display(flex), flexDirection(column), flex_(int(1))]);
};

module RemovePlayerFromTeamMutation = [%graphql
  {|
  mutation RemovePlayerFromTeam(
    $organizationKey: String!,
    $tournamentId: ID!,
    $teamId: ID!,
    $memberId: ID!
  ) {
    removePlayerFromTeam(
      organizationKey: $organizationKey,
      tournamentId: $tournamentId,
      teamId: $teamId,
      memberId: $memberId
    ) {
      id
      organization { key }
      teams {
        id
        playerRefs {
          id
        }
      }
    }
  }
|}
];

module AddPlayerToTeamMutation = [%graphql
  {|
  mutation AddPlayerToTeam(
    $organizationKey: String!,
    $tournamentId: ID!,
    $teamId: ID!,
    $memberId: ID!
  ) {
    addPlayerToTeam(
      organizationKey: $organizationKey,
      tournamentId: $tournamentId,
      teamId: $teamId,
      memberId: $memberId
    ) {
      id
      organization { key }
      teams {
        id
        playerRefs {
          id
        }
      }
    }
  }
|}
];

module RemovePlayerFromTeam =
  ReasonApollo.CreateMutation(RemovePlayerFromTeamMutation);

module AddPlayerToTeam = ReasonApollo.CreateMutation(AddPlayerToTeamMutation);

module TeamFormConnectors = {
  let component = ReasonReact.statelessComponent("TeamFormConnectors");
  let make = children => {
    ...component,
    render: _self =>
      <RemovePlayerFromTeam>
        ...(
             (removePlayerMutation, removePlayerMutationResult) =>
               <AddPlayerToTeam>
                 ...(
                      (addPlayerMutation, addPlayerMutationResult) => {
                        let removePlayerResultComponent =
                          switch (removePlayerMutationResult.result) {
                          | Loading
                          | NotCalled => ReasonReact.null
                          | Error(error) =>
                            let errorMsg =
                              switch (
                                Js.Exn.message(
                                  Client.apolloErrorToJsError(error),
                                )
                              ) {
                              | Some(message) => "Mutation error: " ++ message
                              | None => "An unknown error occurred"
                              };
                            errorMsg |> ReasonReact.string;
                          | Data(_) =>
                            "Player successfully removed" |> ReasonReact.string
                          };
                        let addPlayerResultComponent =
                          switch (addPlayerMutationResult.result) {
                          | Loading
                          | NotCalled => ReasonReact.null
                          | Error(error) =>
                            let errorMsg =
                              switch (
                                Js.Exn.message(
                                  Client.apolloErrorToJsError(error),
                                )
                              ) {
                              | Some(message) => "Mutation error: " ++ message
                              | None => "An unknown error occurred"
                              };
                            errorMsg |> ReasonReact.string;
                          | Data(_) =>
                            "Player successfully added" |> ReasonReact.string
                          };
                        let shouldDisableActions =
                          switch (
                            removePlayerMutationResult.result,
                            addPlayerMutationResult.result,
                          ) {
                          | (Loading, _)
                          | (_, Loading) => true
                          | _ => false
                          };
                        children(
                          ~removePlayerMutation,
                          ~addPlayerMutation,
                          ~removePlayerResultComponent,
                          ~addPlayerResultComponent,
                          ~shouldDisableActions,
                        );
                      }
                    )
               </AddPlayerToTeam>
           )
      </RemovePlayerFromTeam>,
  };
};

module TeamForm = {
  let component = ReasonReact.statelessComponent("TeamForm");
  let make =
      (
        ~team: FetchTournament.team,
        ~teamSize,
        ~tournamentId,
        ~organizationKey,
        ~registeredPlayerIds,
        ~removePlayerMutation: RemovePlayerFromTeam.apolloMutation,
        ~addPlayerMutation: AddPlayerToTeam.apolloMutation,
        ~shouldDisableActions,
        _children,
      ) => {
    ...component,
    render: _self =>
      <div key=team.id>
        <p> ("Team id: " ++ team.id |> ReasonReact.string) </p>
        (
          team.playerRefs
          |> List.mapi((index, playerRef: FetchTournament.playerRef) =>
               <PlayerSlot
                 key=(string_of_int(index))
                 playerId=playerRef.id
                 organizationKey
                 disableAction=shouldDisableActions
                 onRemoveClick=(
                   _event => {
                     let removePlayerFromTeamMutation =
                       RemovePlayerFromTeamMutation.make(
                         ~organizationKey,
                         ~tournamentId,
                         ~teamId=team.id,
                         ~memberId=playerRef.id,
                         (),
                       );
                     removePlayerMutation(
                       ~variables=removePlayerFromTeamMutation##variables,
                       (),
                     )
                     |> ignore;
                   }
                 )
               />
             )
          |> Array.of_list
          |> ReasonReact.array
        )
        {
          let teamSizeDelta = teamSize - List.length(team.playerRefs);
          let numOfRemainingSlots = teamSizeDelta >= 0 ? teamSizeDelta : 0;
          Array.make(numOfRemainingSlots, true)
          |> Array.mapi((index, _empty) =>
               <PlayerSlotEmpty
                 key=(string_of_int(index))
                 registeredPlayerIds
                 fallbackOrganizationKey=organizationKey
                 disableAction=shouldDisableActions
                 onSelect=(
                   playerId => {
                     let addPlayerToTeamMutation =
                       AddPlayerToTeamMutation.make(
                         ~organizationKey,
                         ~tournamentId,
                         ~teamId=team.id,
                         ~memberId=playerId,
                         (),
                       );
                     addPlayerMutation(
                       ~variables=addPlayerToTeamMutation##variables,
                       (),
                     )
                     |> ignore;
                   }
                 )
               />
             )
          |> ReasonReact.array;
        }
      </div>,
  };
};

let split = (numberOfElementsToSplit, listToSplit) => {
  let rec aux = (i, acc) =>
    fun
    | [] => (List.rev(acc), [])
    | [h, ...t] as l =>
      if (i == 0) {
        (List.rev(acc), l);
      } else {
        aux(i - 1, [h, ...acc], t);
      };
  aux(numberOfElementsToSplit, [], listToSplit);
};

let component =
  ReasonReact.statelessComponent("TournamentDetailAddPlayersForm");

let make =
    (
      ~tournamentId,
      ~teamSize,
      ~teams,
      ~organizationKey,
      ~registeredPlayerIds,
      _children,
    ) => {
  ...component,
  render: _self => {
    let halfTheNumberOfTeams = List.length(teams) / 2;
    let (firstHalf, secondHalf) = teams |> split(halfTheNumberOfTeams);
    let canStartTournament =
      teams
      |> Array.of_list
      |> Js.Array.every((team: FetchTournament.team) =>
           List.length(team.playerRefs) == teamSize
         );

    <TeamFormConnectors>
      ...(
           (
             ~removePlayerMutation,
             ~addPlayerMutation,
             ~removePlayerResultComponent,
             ~addPlayerResultComponent,
             ~shouldDisableActions,
           ) =>
             <div>
               removePlayerResultComponent
               addPlayerResultComponent
               <div>
                 (
                   canStartTournament ?
                     <button>
                       ("Start tournament" |> ReasonReact.string)
                     </button> :
                     <button disabled=true>
                       (
                         "Not enough players to start the tournament"
                         |> ReasonReact.string
                       )
                     </button>
                 )
               </div>
               <div className=(Styles.columns |> TypedGlamor.toString)>
                 <div className=(Styles.column |> TypedGlamor.toString)>
                   (
                     firstHalf
                     |> List.map((team: FetchTournament.team) =>
                          <TeamForm
                            key=team.id
                            team
                            teamSize
                            organizationKey
                            tournamentId
                            registeredPlayerIds
                            removePlayerMutation
                            addPlayerMutation
                            shouldDisableActions
                          />
                        )
                     |> Array.of_list
                     |> ReasonReact.array
                   )
                 </div>
                 <div className=(Styles.column |> TypedGlamor.toString)>
                   (
                     secondHalf
                     |> List.map((team: FetchTournament.team) =>
                          <TeamForm
                            key=team.id
                            team
                            teamSize
                            organizationKey
                            tournamentId
                            registeredPlayerIds
                            removePlayerMutation
                            addPlayerMutation
                            shouldDisableActions
                          />
                        )
                     |> Array.of_list
                     |> ReasonReact.array
                   )
                 </div>
               </div>
             </div>
         )
    </TeamFormConnectors>;
  },
};