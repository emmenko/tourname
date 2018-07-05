let component = ReasonReact.statelessComponent("LoadingSpinner");

let make = _children => {
  ...component,
  render: _self => <div> ("LoadingSpinner" |> ReasonReact.string) </div>,
};
