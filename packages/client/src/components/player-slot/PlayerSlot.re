module Styles = {
  open TypedGlamor;
  let slot = css([display(inlineFlex), alignItems(center)]);
  let userAvatar = css([height(px(36)), borderRadius(px(18))]);
};

let component = ReasonReact.statelessComponent("PlayerSlot");

let make = (~playerId, ~organizationKey, ~onRemoveClick=?, _children) => {
  ...component,
  render: _self => {
    let memberQuery =
      FetchMember.FetchMemberQuery.make(~id=playerId, ~organizationKey, ());
    <FetchMember variables=memberQuery##variables>
      ...(
           ({result}) =>
             switch (result) {
             | Loading => <LoadingSpinner />
             | Data(response) =>
               switch (response##member) {
               | Some(player) =>
                 <div className=(Styles.slot |> TypedGlamor.toString)>
                   <div>
                     <img
                       className=(Styles.userAvatar |> TypedGlamor.toString)
                       key="picture"
                       alt="User avatar"
                       src=player.picture
                     />
                   </div>
                   <div>
                     <div> (player.name |> ReasonReact.string) </div>
                     <div> (player.email |> ReasonReact.string) </div>
                   </div>
                   (
                     /* TODO: confirmation dialog */
                     switch (onRemoveClick) {
                     | Some(onClick) =>
                       <div>
                         <button onClick>
                           ("Remove" |> ReasonReact.string)
                         </button>
                       </div>
                     | None => ReasonReact.null
                     }
                   )
                 </div>
               | None =>
                 "Player not found with id: " ++ playerId |> ReasonReact.string
               }
             | Error(error) =>
               Js.log(error);
               ReasonReact.null;
             }
         )
    </FetchMember>;
  },
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~playerId=jsProps##playerId,
      ~organizationKey=jsProps##organizationKey,
      ~onRemoveClick=jsProps##onRemoveClick,
      [||],
    )
  );