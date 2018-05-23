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
        <div> (player##name |> ReasonReact.string) </div>
        <div> (player##email |> ReasonReact.string) </div>
      </div>
      (
        switch (onRemoveClick) {
        | Some(onClick) =>
          <div>
            <button onClick> ("Remove" |> ReasonReact.string) </button>
          </div>
        | None => ReasonReact.null
        }
      )
    </div>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~player=jsProps##player, ~onRemoveClick=jsProps##onRemoveClick, [||])
  );