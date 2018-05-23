let component = ReasonReact.statelessComponent("ApplicationLandingPage");

let make = _children => {
  ...component,
  render: _self =>
    <div>
      <ApplicationBar.Unauthenticated />
      ("Landing page" |> ReasonReact.string)
    </div>,
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));