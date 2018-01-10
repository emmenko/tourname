let component = ReasonReact.statelessComponent("LoadingSpinner");

let make = _children => {
  ...component,
  render: _self => <div> (ReasonReact.stringToElement("LoadingSpinner")) </div>
};