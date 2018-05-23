/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type tournamentSize = [ | `Small | `Medium | `Large];

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
        | Some(v) => tournamentSizeToJs(v)
        | None => ""
        }
      )>
      (
        availableTournamentSizes
        |> Array.mapi((index, (key, label)) =>
             <option
               key=(string_of_int(index)) value=(tournamentSizeToJs(key))>
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
      ~value=tournamentSizeFromJs(jsProps##value),
      ~onChange=jsProps##onChange,
      [||],
    )
  );