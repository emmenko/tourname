let availableTournamentSizes = [|
  (`Small, "Small (4 players)"),
  (`Medium, "Medium (8 players)"),
  (`Large, "Large (16 players)"),
|];

let component = ReasonReact.statelessComponent("SelectTournamentSize");

let make = (~value, ~onChange, _children) => {
  ...component,
  render: _self =>
    <select
      name="discipline"
      onChange
      defaultValue=(
        switch (value) {
        | Some(v) => TournameTypes.tournamentSizeToJs(v)
        | None => ""
        }
      )>
      (
        availableTournamentSizes
        |> Array.mapi((index, (key, label)) =>
             <option
               key=(string_of_int(index))
               value=(TournameTypes.tournamentSizeToJs(key))>
               (label |> ReasonReact.string)
             </option>
           )
        |> ReasonReact.array
      )
    </select>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~value=TournameTypes.tournamentSizeFromJs(jsProps##value),
      ~onChange=jsProps##onChange,
      [||],
    )
  );