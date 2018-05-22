open TypedGlamor;

open ReasonReactRouterDom;

module Styles = {
  let container =
    css([
      display(flex),
      alignItems(center),
      justifyContent(spaceBetween),
      borderBottom3(px(1), solid, hex("ccc")),
      padding(px(8)),
      height(px(36)),
    ]);
  let button =
    css([
      borderRadius(px(3)),
      padding2(~v=px(4), ~h=px(16)),
      margin(zero),
      background(transparent),
      color(hex("0074d9")),
      border3(px(2), solid, hex("0074d9")),
      cursor(pointer),
      select(":hover", [backgroundColor(hex("0074d9")), color(white)]),
    ]);
  let menusContainer =
    css([
      display(inlineFlex),
      alignItems(center),
      justifyContent(center),
      select("> * + *", [marginLeft(px(16))]),
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
      <div className=(Styles.container |> TypedGlamor.toString)>
        <Link to_="/"> (ReasonReact.stringToElement("Logo")) </Link>
        (
          /* See https://reasonml.github.io/reason-react/docs/en/children.html#pitfall */
          ReasonReact.createDomElement(
            "div",
            ~props={
              "className": Styles.menusContainer |> TypedGlamor.toString,
            },
            children,
          )
        )
      </div>,
  };
};

module Authenticated = {
  let component =
    ReasonReact.statelessComponent("ApplicationBarAuthenticated");
  let make = (~showActionsMenu, _children) => {
    ...component,
    render: _self =>
      <ApplicationBarContainer>
        (
          showActionsMenu ?
            <ApplicationBarActionsMenu /> : ReasonReact.nullElement
        )
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
          <div className=(Styles.button |> TypedGlamor.toString)>
            (ReasonReact.stringToElement("Login"))
          </div>
        </a>
      </ApplicationBarContainer>,
  };
};