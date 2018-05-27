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
    Array.make(teamSize, true)
    |> Array.mapi((index, _empty) =>
         switch (team[index]) {
         | playerForIndex =>
           <PlayerSlot
             key=(string_of_int(index))
             player=playerForIndex
             onRemoveClick=(
               _event => {
                 let teamWithoutPlayer =
                   team
                   |> Array.to_list
                   |> List.filter(player => player != playerForIndex)
                   |> Array.of_list;
                 setFieldValue(teamWithoutPlayer);
               }
             )
           />
         | exception (Invalid_argument(_e)) =>
           <PlayerSlotEmpty
             key=(string_of_int(index))
             registeredPlayers=(Array.to_list(registeredPlayers))
             onSelect=(
               player => {
                 let teamWithPlayer = team |> Array.copy;
                 teamWithPlayer[index] = player;
                 setFieldValue(teamWithPlayer);
               }
             )
             fallbackOrganizationKey=organizationKey
           />
         }
       )
    |> ReasonReact.array,
};
