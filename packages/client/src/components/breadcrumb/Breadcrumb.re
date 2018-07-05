open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let activeColor = css([color(hex("0074d9"))]);
  let inactiveColor = css([color(hex("aaa"))]);
};

let component = ReasonReact.statelessComponent("Breadcrumb");

let make = (~linkTo: option(string)=?, children) => {
  ...component,
  render: _self =>
    switch (linkTo) {
    | Some(to_) =>
      <div className=(Styles.activeColor |> TypedGlamor.toString)>
        <Link to_> children </Link>
      </div>
    | None =>
      /* See https://reasonml.github.io/reason-react/docs/en/children.html#pitfall */
      ReasonReact.createDomElement(
        "div",
        ~props={"className": Styles.inactiveColor |> TypedGlamor.toString},
        children,
      )
    },
};
