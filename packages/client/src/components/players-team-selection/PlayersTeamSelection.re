let component = ReasonReact.statelessComponent("PlayersTeamSelection");

let make =
    (
      ~organizationKey,
      ~teamSize,
      ~team,
      ~registeredPlayers,
      ~setFieldValue,
      _children,
    ) => {
  ...component,
  render: _self =>
    <Fragment>
      (
        team
        |> List.mapi((index, player) =>
             <PlayerSlot
               key=(string_of_int(index))
               player
               onRemoveClick=(
                 _event => {
                   let teamWithoutPlayer =
                     team |> List.filter(p => p != player);
                   setFieldValue(teamWithoutPlayer);
                 }
               )
             />
           )
        |> Array.of_list
        |> ReasonReact.array
      )
      {
        let teamSizeDelta = teamSize - List.length(team);
        let numOfRemainingSlots = teamSizeDelta >= 0 ? teamSizeDelta : 0;
        Array.make(numOfRemainingSlots, true)
        |> Array.mapi((index, _empty) =>
             <PlayerSlotEmpty
               key=(string_of_int(index))
               registeredPlayers
               onSelect=(
                 player => {
                   let teamWithPlayer = [player, ...team];
                   setFieldValue(teamWithPlayer);
                 }
               )
               fallbackOrganizationKey=organizationKey
             />
           )
        |> ReasonReact.array;
      }
    </Fragment>,
};