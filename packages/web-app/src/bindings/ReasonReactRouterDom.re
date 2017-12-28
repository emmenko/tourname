module Link = {
  [@bs.module "react-router-dom"]
  external reactClass : ReasonReact.reactClass = "Link";
  let make = (~to_: string, children) =>
    ReasonReact.wrapJsForReason(~reactClass, ~props={"to": to_}, children);
};