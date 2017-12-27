let component = ReasonReact.statelessComponent("KeyCheckHandler");

let make = (~isOrganizationKeyUsed, ~onChange, _children) => {
  ...component,
  /* Since the Apollo query is triggered using a declarative component we need
     to use a child component to trigger `onChange` updates each time the query
     returns a result */
  didUpdate: _oldAndNewSelf => {
    onChange(! isOrganizationKeyUsed);
    ();
  },
  render: _self => {
    let hintText = if (isOrganizationKeyUsed) {"NO"} else {"OK"};
    ReasonReact.stringToElement(hintText);
  }
};