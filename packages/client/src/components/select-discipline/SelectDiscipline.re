let availableDisciplines = [|
  (`PoolTable, "Pool Table"),
  (`TableTennis, "Table Tennis"),
|];

let getEventValue = event => ReactDOMRe.domElementToObj(
                               ReactEventRe.Form.target(event),
                             )##value;

let component = ReasonReact.statelessComponent("SelectDiscipline");

let make = (~value, ~onChange, _children) => {
  ...component,
  render: _self =>
    <select
      name="discipline"
      onChange=(
        event => {
          let value = getEventValue(event);
          switch (TournameTypes.disciplineFromJs(value)) {
          | Some(v) => onChange(v)
          | None => ()
          };
        }
      )
      defaultValue=(TournameTypes.disciplineToJs(value))>
      (
        availableDisciplines
        |> Array.map(((key, label)) => {
             let value = TournameTypes.disciplineToJs(key);
             <option key=value value> (label |> ReasonReact.string) </option>;
           })
        |> ReasonReact.array
      )
    </select>,
};
