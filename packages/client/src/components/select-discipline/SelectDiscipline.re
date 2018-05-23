/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type discipline = [ | `PoolTable | `TableTennis];

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
        | Some(v) => disciplineToJs(v)
        | None => ""
        }
      )>
      <option />
      (
        availableDisciplines
        |> Array.mapi((index, (key, label)) =>
             <option key=(string_of_int(index)) value=(disciplineToJs(key))>
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
      ~value=disciplineFromJs(jsProps##value),
      ~onChange=jsProps##onChange,
      [||],
    )
  );