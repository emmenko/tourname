open TypedGlamor;

module Styles = {
  let slot = css([display(inlineFlex), alignItems(center)]);
  let userAvatar = css([height(px(36)), borderRadius(px(18))]);
};

let component = ReasonReact.statelessComponent("PlayerSlot");

let make = (~player: FetchOrganization.member, ~onRemoveClick=?, _children) => {
  ...component,
  render: _self =>
    <div className=(Styles.slot |> TypedGlamor.toString)>
      <div>
        <img
          className=(Styles.userAvatar |> TypedGlamor.toString)
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
        switch (onRemoveClick) {
        | Some(onClick) =>
          <div>
            <button onClick> (ReasonReact.stringToElement("Remove")) </button>
          </div>
        | None => ReasonReact.nullElement
        }
      )
    </div>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~player=jsProps##player, ~onRemoveClick=jsProps##onRemoveClick, [||])
  );