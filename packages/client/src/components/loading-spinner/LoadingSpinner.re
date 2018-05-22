let component = ReasonReact.statelessComponent("LoadingSpinner");

let make = _children => {
  ...component,
  render: _self => <div> (ReasonReact.stringToElement("LoadingSpinner")) </div>
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));