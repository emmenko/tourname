open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let overlay =
    css([
      backgroundColor(rgba(0, 0, 0, 0.5)),
      position(fixed),
      offsetTop(zero),
      offsetRight(zero),
      offsetBottom(zero),
      offsetLeft(zero),
      display(flex),
      alignItems(center),
      justifyContent(center),
    ]);
  let dialog =
    css([backgroundColor(white), width(px(400)), padding(px(16))]);
  let dialogHeader = css([borderBottom3(px(1), solid, hex("ccc"))]);
  let dialogBody = css([margin2(~v=px(16), ~h=zero)]);
  let dialogFooter = css([borderTop3(px(1), solid, hex("ccc"))]);
  let searchResults =
    css([
      marginTop(px(16)),
      width(pct(100.)),
      select("> * + *", [marginTop(px(4))]),
    ]);
  let selectableItem =
    css([
      borderLeft3(px(2), solid, hex("ccc")),
      backgroundColor(white),
      select(":hover", [backgroundColor(hex("eee"))]),
    ]);
  let activeSelectableItem =
    css([
      borderLeft3(px(2), solid, hex("aaa")),
      backgroundColor(hex("ccc")),
      select(":hover", [backgroundColor(hex("ccc"))]),
    ]);
};

module Modal = {
  [@bs.module "../modal"]
  external reactClass : ReasonReact.reactClass = "default";
  let make = children =>
    ReasonReact.wrapJsForReason(~reactClass, ~props=Js.Obj.empty(), children);
};

module PlayerSearchDialog = {
  let getEventValue = event => ReactDOMRe.domElementToObj(
                                 ReactEventRe.Form.target(event),
                               )##value;
  type state = {
    searchText: string,
    selectedPlayerId: option(string),
  };
  type action =
    | SetSearchText(string)
    | SetSelectedPlayerId(string);
  let component = ReasonReact.reducerComponent("PlayerSearchDialog");
  let make =
      (~registeredPlayerIds, ~onSelect, ~onClose, ~organizationKey, _children) => {
    ...component,
    initialState: () => {searchText: "", selectedPlayerId: None},
    reducer: (action, state) =>
      switch (action) {
      | SetSearchText(value) =>
        ReasonReact.Update({...state, searchText: value})
      | SetSelectedPlayerId(playerId) =>
        ReasonReact.Update({...state, selectedPlayerId: Some(playerId)})
      },
    render: self => {
      let membersQuery =
        FetchMembers.FetchMembersQuery.make(~organizationKey, ());
      <Modal>
        <div className=(Styles.overlay |> TypedGlamor.toString)>
          <div className=(Styles.dialog |> TypedGlamor.toString)>
            <div className=(Styles.dialogHeader |> TypedGlamor.toString)>
              (
                "Search and select a player to add to the team"
                |> ReasonReact.string
              )
            </div>
            <div className=(Styles.dialogBody |> TypedGlamor.toString)>
              <input
                value=self.state.searchText
                onChange=(
                  event => self.send(SetSearchText(getEventValue(event)))
                )
              />
              <div className=(Styles.searchResults |> TypedGlamor.toString)>
                <FetchMembers variables=membersQuery##variables>
                  ...(
                       ({result}) =>
                         switch (result) {
                         | Loading => <LoadingSpinner />
                         | Data(response) =>
                           /* We need to convert it to a list to perform some basic
                              operations like `filter` and `exists` because `Array` does
                              not support it. */
                           let filteredList =
                             switch (registeredPlayerIds) {
                             | [] => response##members |> Array.to_list
                             | _ =>
                               response##members
                               |> Array.to_list
                               |> List.filter(member =>
                                    ! (
                                      registeredPlayerIds
                                      |> List.exists(id => id == member##id)
                                    )
                                  )
                             };
                           if (List.length(filteredList) == 0) {
                             "No more members available" |> ReasonReact.string;
                           } else {
                             /* Filter our members already in use,
                                then render the list of available members */
                             filteredList
                             |> List.filter(member =>
                                  self.state.searchText == ""
                                  || Js.String.includes(
                                       String.lowercase(
                                         self.state.searchText,
                                       ),
                                       String.lowercase(member##name),
                                     )
                                  || Js.String.includes(
                                       String.lowercase(
                                         self.state.searchText,
                                       ),
                                       String.lowercase(member##email),
                                     )
                                )
                             |> List.map(member =>
                                  <div
                                    className=(
                                      switch (self.state.selectedPlayerId) {
                                      | Some(playerId) =>
                                        if (playerId == member##id) {
                                          Styles.activeSelectableItem
                                          |> TypedGlamor.toString;
                                        } else {
                                          Styles.selectableItem
                                          |> TypedGlamor.toString;
                                        }
                                      | None =>
                                        Styles.selectableItem
                                        |> TypedGlamor.toString
                                      }
                                    )
                                    key=member##id
                                    onClick=(
                                      _event =>
                                        self.send(
                                          SetSelectedPlayerId(member##id),
                                        )
                                    )>
                                    <PlayerSlot
                                      playerId=member##id
                                      organizationKey
                                    />
                                  </div>
                                )
                             |> Array.of_list
                             |> ReasonReact.array;
                           };
                         | Error(error) =>
                           Js.log(error);
                           ReasonReact.null;
                         }
                     )
                </FetchMembers>
              </div>
            </div>
            <div className=(Styles.dialogFooter |> TypedGlamor.toString)>
              <button onClick=onClose>
                ("Cancel" |> ReasonReact.string)
              </button>
              (
                switch (self.state.selectedPlayerId) {
                | Some(playerId) =>
                  <button
                    disabled=false
                    onClick=(
                      event => {
                        onSelect(playerId);
                        onClose(event);
                      }
                    )>
                    ("Select" |> ReasonReact.string)
                  </button>
                | None =>
                  <button disabled=true>
                    ("Select" |> ReasonReact.string)
                  </button>
                }
              )
            </div>
          </div>
        </div>
      </Modal>;
    },
  };
};

let component = ReasonReact.statelessComponent("ConnectedPlayerSearchDialog");

let make =
    (
      ~registeredPlayerIds,
      ~onSelect,
      ~onClose,
      ~fallbackOrganizationKey,
      _children,
    ) => {
  ...component,
  render: _self =>
    <Route
      render=(
        renderProps =>
          <PlayerSearchDialog
            registeredPlayerIds
            onSelect
            onClose
            organizationKey=(
              switch (
                Js.Dict.get(renderProps##_match##params, "organizationKey")
              ) {
              | Some(key) => key
              | None => fallbackOrganizationKey
              }
            )
          />
      )
    />,
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~registeredPlayerIds=jsProps##registeredPlayerIds,
      ~onSelect=jsProps##onSelect,
      ~onClose=jsProps##onClose,
      ~fallbackOrganizationKey=jsProps##fallbackOrganizationKey,
      [||],
    )
  );