let component = ReasonReact.statelessComponent("PlayersTeamSelection");

let make =
    (
      ~organizationKey,
      ~teamSize,
      ~teamPlayerIds,
      ~registeredPlayerIds,
      ~setFieldValue,
      _children,
    ) => {
  ...component,
  render: _self =>
    <Fragment>
      (
        teamPlayerIds
        |> List.mapi((index, playerId) =>
             <PlayerSlot
               key=(string_of_int(index))
               playerId
               organizationKey
               onRemoveClick=(
                 _event => {
                   let teamPlayerIdsWithoutPlayerId =
                     teamPlayerIds |> List.filter(id => id != playerId);
                   setFieldValue(teamPlayerIdsWithoutPlayerId);
                 }
               )
             />
           )
        |> Array.of_list
        |> ReasonReact.array
      )
      {
        let teamSizeDelta = teamSize - List.length(teamPlayerIds);
        let numOfRemainingSlots = teamSizeDelta >= 0 ? teamSizeDelta : 0;
        Array.make(numOfRemainingSlots, true)
        |> Array.mapi((index, _empty) =>
             <PlayerSlotEmpty
               key=(string_of_int(index))
               registeredPlayerIds
               onSelect=(
                 playerId => {
                   let teamPlayerIdsWithPlayerId = [
                     playerId,
                     ...teamPlayerIds,
                   ];
                   setFieldValue(teamPlayerIdsWithPlayerId);
                 }
               )
               fallbackOrganizationKey=organizationKey
             />
           )
        |> ReasonReact.array;
      }
    </Fragment>,
};