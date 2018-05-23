open TypedGlamor;

/* FIXME: remove once the component has been migrated to reason */
module QuickMatchCreate = {
  [@bs.module "../quick-match-create"]
  external reactClass : ReasonReact.reactClass = "default";
  let make = (~onCancel, children) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={"onCancel": onCancel},
      children,
    );
};

/* FIXME: remove once the component has been migrated to reason */
module TournamentCreate = {
  [@bs.module "../tournament-create"]
  external reactClass : ReasonReact.reactClass = "default";
  let make = (~onCancel, children) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={"onCancel": onCancel},
      children,
    );
};

module Styles = {
  let selectionHeader =
    css([
      display(inlineFlex),
      justifyContent(spaceEvenly),
      alignItems(center),
      width(pct(100.)),
    ]);
  let headerBox = (~isSmall, ~isSelected) =>
    css([
      alignItems(center),
      backgroundColor(hex("fafafa")),
      display(flex),
      fontSize(px(32)),
      height(px(250)),
      justifyContent(center),
      padding2(~v=px(16), ~h=px(32)),
      textAlign(center),
      width(px(250)),
      if (isSmall) {
        add([
          fontSize(px(16)),
          height(auto),
          transitions([
            (AnimatableProperty.fontSize, ms(300), linear, ms(0)),
            (AnimatableProperty.height, ms(500), linear, ms(0)),
          ]),
        ]);
      } else {
        add([]);
      },
      if (isSelected) {
        add([backgroundColor(blue)]);
      } else {
        add([]);
      },
    ]);
};

type mode =
  | NoSelection
  | QuickMatch
  | Tournament;

type state = {mode};

type action =
  | CancelSelection
  | SelectQuickMatch
  | SelectTournament;

let component = ReasonReact.reducerComponent("SelectNewTournament");

let make = _children => {
  ...component,
  initialState: () => {mode: NoSelection},
  reducer: (action, _state) =>
    switch (action) {
    | CancelSelection => ReasonReact.Update({mode: NoSelection})
    | SelectQuickMatch => ReasonReact.Update({mode: QuickMatch})
    | SelectTournament => ReasonReact.Update({mode: Tournament})
    },
  render: self => {
    let content =
      switch (self.state.mode) {
      | NoSelection => ReasonReact.null
      | QuickMatch =>
        <QuickMatchCreate onCancel=(_event => self.send(CancelSelection)) />
      | Tournament =>
        <TournamentCreate onCancel=(_event => self.send(CancelSelection)) />
      };
    <div>
      <div className=(Styles.selectionHeader |> TypedGlamor.toString)>
        <div
          className=(
            Styles.headerBox(
              ~isSmall=self.state.mode == NoSelection,
              ~isSelected=self.state.mode == QuickMatch,
            )
            |> TypedGlamor.toString
          )
          onClick=(_event => self.send(SelectQuickMatch))>
          ("Quick match" |> ReasonReact.string)
        </div>
        <div
          className=(
            Styles.headerBox(
              ~isSmall=self.state.mode == NoSelection,
              ~isSelected=self.state.mode == Tournament,
            )
            |> TypedGlamor.toString
          )
          onClick=(_event => self.send(SelectTournament))>
          ("New Tournament" |> ReasonReact.string)
        </div>
      </div>
      content
    </div>;
  },
};

let default = ReasonReact.wrapReasonForJs(~component, () => make([||]));
