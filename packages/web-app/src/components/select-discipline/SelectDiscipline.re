type disciplines =
  | TableTennis(string, string)
  | PoolTable(string, string);

let listOptions = [|
  TableTennis("TABLE_TENNIS", "Table Tennis"),
  PoolTable("POOL_TABLE", "Pool Table")
|];

let getOptionKey = option =>
  switch option {
  | TableTennis(key, _) => key
  | PoolTable(key, _) => key
  };

let getOptionLabel = option =>
  switch option {
  | TableTennis(_, label) => label
  | PoolTable(_, label) => label
  };

let component = ReasonReact.statelessComponent("SelectDiscipline");

let make = (~value=?, ~onChange, _children) => {
  ...component,
  render: _self =>
    <select name="discipline" ?value onChange>
      <option />
      (
        ReasonReact.arrayToElement(
          Array.mapi(
            (index, option) =>
              <option key=(string_of_int(index)) value=(getOptionKey(option))>
                (ReasonReact.stringToElement(getOptionLabel(option)))
              </option>,
            listOptions
          )
        )
      )
    </select>
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~value=?Js.Nullable.to_opt(jsProps##value),
      ~onChange=jsProps##onChange,
      [||]
    )
  );