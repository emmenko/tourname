open Glamor;

module Styles = {
  let breadcrumbContainer =
    css([
      display("flex"),
      alignItems("center"),
      Selector("> * + *", [margin("0 0 0 8px")])
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
    <div className=Styles.breadcrumbContainer>
      (
        ReasonReact.arrayToElement(
          Array.mapi(
            (index, child) => {
              let isLastChild = index == numberOfBreadcrumbs - 1;
              if (isLastChild) {
                child;
              } else {
                <Fragment key=(string_of_int(index))>
                  ...(
                       child,
                       <div> (ReasonReact.stringToElement(separator)) </div>
                     )
                </Fragment>;
              };
            },
            children
          )
        )
      )
    </div>;
  }
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~separator=jsProps##separator, jsProps##children)
  );