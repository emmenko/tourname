open Glamor;

module Styles = {
  let text = css([margin("0")]);
  let placeholder =
    css([
      backgroundColor("#eaeaea"),
      height("36px"),
      margin("0"),
      width("200px")
    ]);
};

let component = ReasonReact.statelessComponent("Welcome");

let make = (~name=?, _children) => {
  ...component,
  render: _self =>
    switch name {
    | Some(n) =>
      <h1 className=Styles.text>
        (ReasonReact.stringToElement({j|Welcome $n|j}))
      </h1>
    | None => <h1 className=Styles.placeholder />
    }
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~name=jsProps##name, [||])
  );