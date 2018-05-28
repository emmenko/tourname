let availableTournamentSizes = [|
  (`Small, "Small (4 players)"),
  (`Medium, "Medium (8 players)"),
  (`Large, "Large (16 players)"),
|];

let getEventValue = event => ReactDOMRe.domElementToObj(
                               ReactEventRe.Form.target(event),
                             )##value;

let component = ReasonReact.statelessComponent("SelectTournamentSize");

let make = (~value, ~onChange, _children) => {
  ...component,
  render: _self =>
    <select
      name="tournamentSize"
      onChange=(
        event => {
          let value = getEventValue(event);
          switch (TournameTypes.tournamentSizeFromJs(value)) {
          | Some(v) => onChange(v)
          | None => ()
          };
        }
      )
      defaultValue=(TournameTypes.tournamentSizeToJs(value))>
      (
        availableTournamentSizes
        |> Array.map(((key, label)) => {
             let value = TournameTypes.tournamentSizeToJs(key);
             <option key=value value> (label |> ReasonReact.string) </option>;
           })
        |> ReasonReact.array
      )
    </select>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~value=jsProps##value, ~onChange=jsProps##onChange, [||])
  );