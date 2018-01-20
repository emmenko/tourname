open Glamor;

module Styles = {
  let slot = css([display("inline-flex"), alignItems("center")]);
  let avatarPlaceholder =
    css([
      height("36px"),
      width("36px"),
      border("1px dashed #ccc"),
      borderRadius("36px")
    ]);
};

module Fragment = {
  [@bs.module "react"]
  external reactClass : ReasonReact.reactClass = "Fragment";
  let make = children =>
    ReasonReact.wrapJsForReason(~reactClass, ~props=Js.Obj.empty(), children);
};

type state = {showPlayerSearchDialog: bool};

type action =
  | ShowPlayerSearchDialog
  | HidePlayerSearchDialog;

let component = ReasonReact.reducerComponent("PlayerSlotEmpty");

let make = (~registeredPlayers, ~onSelect, ~fallbackOrganizationKey, _children) => {
  ...component,
  initialState: () => {showPlayerSearchDialog: false},
  reducer: (action, _state) =>
    switch action {
    | ShowPlayerSearchDialog =>
      ReasonReact.Update({showPlayerSearchDialog: true})
    | HidePlayerSearchDialog =>
      ReasonReact.Update({showPlayerSearchDialog: false})
    },
  render: self =>
    <Fragment>
      <div className=Styles.slot>
        <div> <div className=Styles.avatarPlaceholder /> </div>
        <div>
          <button
            onClick=(_event => self.reduce(() => ShowPlayerSearchDialog, ()))>
            (ReasonReact.stringToElement("Add a player to this team"))
          </button>
        </div>
      </div>
      (
        self.state.showPlayerSearchDialog ?
          <PlayerSearchDialog
            registeredPlayers
            onSelect
            onClose=(_event => self.reduce(() => HidePlayerSearchDialog, ()))
            fallbackOrganizationKey
          /> :
          ReasonReact.nullElement
      )
    </Fragment>
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~registeredPlayers=jsProps##registeredPlayers,
      ~onSelect=jsProps##onSelect,
      ~fallbackOrganizationKey=jsProps##fallbackOrganizationKey,
      [||]
    )
  );