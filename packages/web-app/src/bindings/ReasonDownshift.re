type toggleObj;

[@bs.obj] external getToggleObj : unit => toggleObj = "";

type renderFunc =
  {
    .
    /* Getters */
    /* "getButtonProps": [@bs.meth] (Js.Dict.t(string) => Js.Dict.t(string)),
       "getInputProps": [@bs.meth] (Js.Dict.t(string) => Js.Dict.t(string)),
       "getItemProps": [@bs.meth] (Js.Dict.t(string) => Js.Dict.t(string)),
       "getLabelProps": [@bs.meth] (Js.Dict.t(string) => Js.Dict.t(string)),
       "getRootProps":
         [@bs.meth] ((Js.Dict.t(string), Js.Dict.t(string)) => Js.Dict.t(string)), */
    "isOpen": bool,
    "toggleMenu": [@bs.meth] (toggleObj => unit)
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
