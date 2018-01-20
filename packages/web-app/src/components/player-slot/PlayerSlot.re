open Glamor;

module Styles = {
  let slot = css([display("inline-flex"), alignItems("center")]);
  let userAvatar = css([height("36px"), borderRadius("18px")]);
};

let component = ReasonReact.statelessComponent("PlayerSlot");

let make = (~player: FetchOrganization.member, ~onRemoveClick=?, _children) => {
  ...component,
  render: _self =>
    <div className=Styles.slot>
      <div>
        <img
          className=Styles.userAvatar
          key="picture"
          alt="User avatar"
          src=player##picture
        />
      </div>
      <div>
        <div> (ReasonReact.stringToElement(player##name)) </div>
        <div> (ReasonReact.stringToElement(player##email)) </div>
      </div>
      (
        switch onRemoveClick {
        | Some(onClick) =>
          <div>
            <button onClick> (ReasonReact.stringToElement("Remove")) </button>
          </div>
        | None => ReasonReact.nullElement
        }
      )
    </div>
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~player=jsProps##player, ~onRemoveClick=jsProps##onRemoveClick, [||])
  );