let component = ReasonReact.statelessComponent("ApplicationLandingPage");

let make = _children => {
  ...component,
  render: _self =>
    <div>
      <ApplicationBar isUserAuthenticated=false />
      (ReasonReact.stringToElement("Landing page"))
    </div>
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));