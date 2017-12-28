type toggleMenuObj;

type noop = unit => unit;

[@bs.obj]
external getToggleObj :
  (~otherStateToSet: Js.t({..})=?, ~cb: noop=?, unit) => toggleMenuObj =
  "";

type renderFunc =
  {
    .
    "isOpen": bool,
    "toggleMenu": [@bs.meth] (toggleMenuObj => unit)
  } =>
  ReasonReact.reactElement;

module Downshift = {
  [@bs.module "downshift"]
  external reactClass : ReasonReact.reactClass = "default";
  let make = (~render: renderFunc, children) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={"render": render},
      children
    );
};