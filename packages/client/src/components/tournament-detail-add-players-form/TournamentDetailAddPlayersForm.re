module Styles = {
  open TypedGlamor;
  let columns = css([display(flex), flexDirection(row)]);
  let column = css([display(flex), flexDirection(column), flex_(int(1))]);
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
                 onRemoveClick=(_event => Js.log("removed"))
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
                 onSelect=(_player => Js.log("on select"))
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

    <div>
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
                 />
               )
            |> Array.of_list
            |> ReasonReact.array
          )
        </div>
      </div>
    </div>;
  },
};