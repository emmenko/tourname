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
    let teams = teams |> Array.of_list;
    let halfTheNumberOfTeams = Array.length(teams) / 2;
    let firstHalf =
      teams |> Js.Array.slice(~start=0, ~end_=halfTheNumberOfTeams);
    let secondHalf =
      teams
      |> Js.Array.slice(
           ~start=halfTheNumberOfTeams,
           ~end_=Array.length(teams) - 1,
         );
    let canStartTournament =
      teams
      |> Js.Array.every((team: FetchTournament.team) =>
           List.length(team.playerRefs) == teamSize
         );

    <div>
      <div className=(Styles.columns |> TypedGlamor.toString)>
        <div className=(Styles.column |> TypedGlamor.toString)>
          (
            firstHalf
            |> Array.map((team: FetchTournament.team) =>
                 <TeamForm
                   key=team.id
                   team
                   teamSize
                   organizationKey
                   tournamentId
                   registeredPlayerIds
                 />
               )
            |> ReasonReact.array
          )
        </div>
        <div className=(Styles.column |> TypedGlamor.toString)>
          (
            secondHalf
            |> Array.map((team: FetchTournament.team) =>
                 <TeamForm
                   key=team.id
                   team
                   teamSize
                   organizationKey
                   tournamentId
                   registeredPlayerIds
                 />
               )
            |> ReasonReact.array
          )
        </div>
      </div>
    </div>;
  },
};