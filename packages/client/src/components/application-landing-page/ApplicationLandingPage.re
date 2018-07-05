let component = ReasonReact.statelessComponent("ApplicationLandingPage");

let make = _children => {
  ...component,
  render: _self =>
    <div>
      <ApplicationBar.Unauthenticated />
      ("Landing page" |> ReasonReact.string)
    </div>,
};
