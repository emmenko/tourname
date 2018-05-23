module Styles = {
  open TypedGlamor;
  let slot = css([display(inlineFlex), alignItems(center)]);
  let avatarPlaceholder =
    css([
      height(px(36)),
      width(px(36)),
      border3(px(1), dashed, hex("ccc")),
      borderRadius(px(36)),
    ]);
};

type state = {showPlayerSearchDialog: bool};

type action =
  | ShowPlayerSearchDialog
  | HidePlayerSearchDialog;

let component = ReasonReact.reducerComponent("PlayerSlotEmpty");

let make =
    (~registeredPlayers, ~onSelect, ~fallbackOrganizationKey, _children) => {
  ...component,
  initialState: () => {showPlayerSearchDialog: false},
  reducer: (action, _state) =>
    switch (action) {
    | ShowPlayerSearchDialog =>
      ReasonReact.Update({showPlayerSearchDialog: true})
    | HidePlayerSearchDialog =>
      ReasonReact.Update({showPlayerSearchDialog: false})
    },
  render: self =>
    <Fragment>
      <div className=(Styles.slot |> TypedGlamor.toString)>
        <div>
          <div className=(Styles.avatarPlaceholder |> TypedGlamor.toString) />
        </div>
        <div>
          <button onClick=(_event => self.send(ShowPlayerSearchDialog))>
            ("Add a player to this team" |> ReasonReact.string)
          </button>
        </div>
      </div>
      (
        self.state.showPlayerSearchDialog ?
          <PlayerSearchDialog
            registeredPlayers
            onSelect
            onClose=(_event => self.send(HidePlayerSearchDialog))
            fallbackOrganizationKey
          /> :
          ReasonReact.null
      )
    </Fragment>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~registeredPlayers=jsProps##registeredPlayers,
      ~onSelect=jsProps##onSelect,
      ~fallbackOrganizationKey=jsProps##fallbackOrganizationKey,
      [||],
    )
  );