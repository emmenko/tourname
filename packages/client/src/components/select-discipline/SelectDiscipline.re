let availableDisciplines = [|
  (`PoolTable, "Pool Table"),
  (`TableTennis, "Table Tennis"),
|];

let component = ReasonReact.statelessComponent("SelectDiscipline");

let make = (~value, ~onChange, _children) => {
  ...component,
  render: _self =>
    <select
      name="discipline"
      onChange
      defaultValue=(
        switch (value) {
        | Some(v) => TournameTypes.disciplineToJs(v)
        | None => ""
        }
      )>
      (
        availableDisciplines
        |> Array.mapi((index, (key, label)) =>
             <option
               key=(string_of_int(index))
               value=(TournameTypes.disciplineToJs(key))>
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
      ~value=TournameTypes.disciplineFromJs(jsProps##value),
      ~onChange=jsProps##onChange,
      [||],
    )
  );