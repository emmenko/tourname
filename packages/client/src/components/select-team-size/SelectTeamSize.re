let maxTeamSize = 20;

let component = ReasonReact.statelessComponent("SelectTeamSize");

let make = (~value: option(int)=?, ~onChange, _children) => {
  let handleChange = event =>
    onChange(
      int_of_string(
        ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value,
      ),
    );
  {
    ...component,
    render: _self => {
      let formattedValue =
        switch (value) {
        | None => ""
        | Some(v) => string_of_int(v)
        };
      <select name="teamSize" value=formattedValue onChange=handleChange>
        (
          Array.init(
            maxTeamSize,
            index => {
              let size = index + 1;
              <option key=(string_of_int(index)) value=(string_of_int(size))>
                (string_of_int(size) |> ReasonReact.string)
              </option>;
            },
          )
          |> ReasonReact.array
        )
      </select>;
    },
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~value=?Js.Nullable.to_opt(jsProps##value),
      ~onChange=jsProps##onChange,
      [||],
    )
  );