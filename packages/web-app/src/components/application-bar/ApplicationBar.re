open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let container =
    css([
      display("flex"),
      alignItems("center"),
      justifyContent("space-between"),
      borderBottom("1px solid #ccc"),
      padding("8px"),
      height("36px"),
    ]);
  let button =
    css([
      borderRadius("3px"),
      padding("4px 16px"),
      margin("0"),
      background("transparent"),
      color("#0074d9"),
      border("2px solid #0074d9"),
      cursor("pointer"),
      Selector(":hover", [backgroundColor("#0074d9"), color("white")]),
    ]);
  let menusContainer =
    css([
      display("inline-flex"),
      alignItems("center"),
      justifyContent("center"),
      Selector("> * + *", [margin("0 0 0 16px")]),
    ]);
};

module Fragment = {
  [@bs.module "react"]
  external reactClass : ReasonReact.reactClass = "Fragment";
  let make = children =>
    ReasonReact.wrapJsForReason(~reactClass, ~props=Js.Obj.empty(), children);
};

module ApplicationBarContainer = {
  let component = ReasonReact.statelessComponent("ApplicationBarContainer");
  let make = children => {
    ...component,
    render: _self =>
      <div className=Styles.container>
        <Link to_="/"> (ReasonReact.stringToElement("Logo")) </Link>
        (
          /* See https://reasonml.github.io/reason-react/docs/en/children.html#pitfall */
          ReasonReact.createDomElement(
            "div",
            ~props={"className": Styles.menusContainer},
            children,
          )
        )
      </div>,
  };
};

module Authenticated = {
  let component =
    ReasonReact.statelessComponent("ApplicationBarAuthenticated");
  let make = _children => {
    ...component,
    render: _self =>
      <ApplicationBarContainer>
        <ApplicationBarActionsMenu />
        <ApplicationBarUserMenu />
      </ApplicationBarContainer>,
  };
};

module Unauthenticated = {
  let component =
    ReasonReact.statelessComponent("ApplicationBarUnauthenticated");
  let make = _children => {
    ...component,
    render: _self =>
      <ApplicationBarContainer>
        <a
          onClick=(
            _event => ReasonAuth.authorize(Js_null_undefined.undefined)
          )>
          <div className=Styles.button>
            (ReasonReact.stringToElement("Login"))
          </div>
        </a>
      </ApplicationBarContainer>,
  };
};