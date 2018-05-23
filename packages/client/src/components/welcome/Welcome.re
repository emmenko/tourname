module Styles = {
  open TypedGlamor;
  let text = css([margin(zero)]);
  let placeholder =
    css([
      backgroundColor(hex("eaeaea")),
      height(px(36)),
      margin(zero),
      width(px(200)),
    ]);
};

let component = ReasonReact.statelessComponent("Welcome");

let make = (~name=?, _children) => {
  ...component,
  render: _self =>
    switch (name) {
    | Some(n) =>
      <h1 className=(Styles.text |> TypedGlamor.toString)>
        ({j|Welcome $n|j} |> ReasonReact.string)
      </h1>
    | None => <h1 className=(Styles.placeholder |> TypedGlamor.toString) />
    },
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~name=jsProps##name, [||])
  );