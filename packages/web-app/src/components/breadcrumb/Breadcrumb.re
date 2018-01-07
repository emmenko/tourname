open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let activeColor = css([color("#0074d9")]);
  let inactiveColor = css([color("#aaa")]);
};

let component = ReasonReact.statelessComponent("Breadcrumb");

let make = (~linkTo: Js.Nullable.t(string), children) => {
  ...component,
  render: _self => {
    let linkToOption = Js.Nullable.to_opt(linkTo);
    switch linkToOption {
    | Some(to_) =>
      <div className=Styles.activeColor> <Link to_> children </Link> </div>
    | None =>
      /* See https://reasonml.github.io/reason-react/docs/en/children.html#pitfall */
      ReasonReact.createDomElement(
        "div",
        ~props={"className": Styles.inactiveColor},
        children
      )
    };
  }
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~linkTo=jsProps##linkTo, jsProps##children)
  );