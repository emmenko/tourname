/* (almost) copied from https://github.com/reasonml-community/bs-react-router/blob/master/src/reactRouter.re */
module type RouteMatchParams = {type params;};

module SpecifyRouterMatch = (Config: RouteMatchParams) => {
  type match = {. "params": Config.params};
};

type renderFunc =
  {
    .
    /* Use name mangling notation prefix `_` to circumvent reserved names clashing.
       https://bucklescript.github.io/docs/en/object.html#invalid-field-names */
    "_match": {. "params": Js.Dict.t(string)},
    "history": History.History.t,
    "location": History.History.Location.t
  } =>
  ReasonReact.reactElement;

let optionToBool = optional =>
  switch optional {
  | Some(_) => true
  | _ => false
  };

module BrowserRouter = {
  [@bs.module "react-router-dom"]
  external browserRouter : ReasonReact.reactClass = "BrowserRouter";
  let make = children =>
    ReasonReact.wrapJsForReason(
      ~reactClass=browserRouter,
      ~props=Js.Obj.empty(),
      children
    );
};

module Link = {
  [@bs.module "react-router-dom"]
  external reactClass : ReasonReact.reactClass = "Link";
  let make = (~to_: string, children) =>
    ReasonReact.wrapJsForReason(~reactClass, ~props={"to": to_}, children);
};

module Redirect = {
  [@bs.module "react-router-dom"]
  external reactClass : ReasonReact.reactClass = "Redirect";
  let make = (~to_: string, children) =>
    ReasonReact.wrapJsForReason(~reactClass, ~props={"to": to_}, children);
};

module Route = {
  [@bs.module "react-router-dom"]
  external reactClass : ReasonReact.reactClass = "Route";
  let make =
      (
        ~exact: option(bool)=?,
        ~path: option(string)=?,
        ~component: option(ReasonReact.reactClass)=?,
        ~render: option(renderFunc)=?,
        children
      ) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={
        "exact": Js.Boolean.to_js_boolean(optionToBool(exact)),
        "path": Js.Null_undefined.fromOption(path),
        "component": Js.Null_undefined.fromOption(component),
        "render": Js.Null_undefined.fromOption(render)
      },
      children
    );
};

module Switch = {
  [@bs.module "react-router-dom"]
  external reactClass : ReasonReact.reactClass = "Switch";
  let make = children =>
    ReasonReact.wrapJsForReason(~reactClass, ~props=Js.Obj.empty(), children);
};