open TypedGlamor;

module Styles = {
  let breadcrumbContainer =
    css([
      display(flex),
      alignItems(center),
      select("> * + *", [marginLeft(px(8))]),
    ]);
};

module Fragment = {
  [@bs.module "react"]
  external reactClass : ReasonReact.reactClass = "Fragment";
  let make = children =>
    ReasonReact.wrapJsForReason(~reactClass, ~props=Js.Obj.empty(), children);
};

let component = ReasonReact.statelessComponent("Breadcrumbs");

let make = (~separator, children) => {
  ...component,
  render: _self => {
    let numberOfBreadcrumbs = Array.length(children);
    <div className=(Styles.breadcrumbContainer |> TypedGlamor.toString)>
      (
        children
        |> Array.mapi((index, child) => {
             let isLastChild = index == numberOfBreadcrumbs - 1;
             if (isLastChild) {
               child;
             } else {
               <Fragment key=(string_of_int(index))>
                 ...(child, <div> (separator |> ReasonReact.string) </div>)
               </Fragment>;
             };
           })
        |> ReasonReact.array
      )
    </div>;
  },
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~separator=jsProps##separator, jsProps##children)
  );