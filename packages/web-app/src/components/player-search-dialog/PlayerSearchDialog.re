open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let overlay =
    css([
      backgroundColor("rgba(0,0,0,0.5)"),
      position("fixed"),
      top("0"),
      bottom("0"),
      left("0"),
      right("0"),
      display("flex"),
      alignItems("center"),
      justifyContent("center"),
    ]);
  let dialog =
    css([backgroundColor("white"), width("400px"), padding("16px")]);
  let dialogHeader = css([borderBottom("1px solid #ccc")]);
  let dialogBody = css([margin("16px 0")]);
  let dialogFooter = css([borderTop("1px solid #ccc")]);
  let searchResults =
    css([
      marginTop("16px"),
      width("100%"),
      Selector("> * + *", [margin("4px 0 0")]),
    ]);
  let selectableItem =
    css([
      borderLeft("2px solid #ccc"),
      backgroundColor("white"),
      Selector(":hover", [backgroundColor("#eee")]),
    ]);
  let activeSelectableItem =
    css([
      borderLeft("2px solid #aaa"),
      backgroundColor("#ccc"),
      Selector(":hover", [backgroundColor("#ccc")]),
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
    selectedPlayer: option(FetchOrganization.member),
  };
  type action =
    | SetSearchText(string)
    | SetSelectedPlayer(FetchOrganization.member);
  let component = ReasonReact.reducerComponent("PlayerSearchDialog");
  let make =
      (~registeredPlayers, ~onSelect, ~onClose, ~organizationKey, _children) => {
    ...component,
    initialState: () => {searchText: "", selectedPlayer: None},
    reducer: (action, state) =>
      switch (action) {
      | SetSearchText(value) =>
        ReasonReact.Update({...state, searchText: value})
      | SetSelectedPlayer(player) =>
        ReasonReact.Update({...state, selectedPlayer: Some(player)})
      },
    render: self => {
      let organizationQuery =
        FetchOrganization.OrganizationQuery.make(~key=organizationKey, ());
      <Modal>
        <div className=Styles.overlay>
          <div className=Styles.dialog>
            <div className=Styles.dialogHeader>
              (
                ReasonReact.stringToElement(
                  "Search and select a player to add to the team",
                )
              )
            </div>
            <div className=Styles.dialogBody>
              <input
                value=self.state.searchText
                onChange=(
                  event => self.send(SetSearchText(getEventValue(event)))
                )
              />
              <div className=Styles.searchResults>
                <FetchOrganization variables=organizationQuery##variables>
                  ...(
                       ({result}) =>
                         switch (result) {
                         | NoData => ReasonReact.stringToElement("No data...")
                         | Loading => <LoadingSpinner />
                         | Data(response) =>
                           let filteredList =
                             switch (response##organization) {
                             | Some(org) =>
                               List.filter(
                                 member =>
                                   List.exists(
                                     id => id != member##id,
                                     registeredPlayers,
                                   ),
                                 Array.to_list(org##members),
                               )
                             | None => []
                             };
                           /* We need to convert it to a list to perform some basic
                              operations like `filter` and `exists` because `Array` does
                              not support it. */
                           /* let filteredList =
                              List.filter(
                                member =>
                                  List.exists(
                                    id => id != member##id,
                                    registeredPlayers,
                                  ),
                                members,
                              ); */
                           if (List.length(filteredList) == 0) {
                             ReasonReact.stringToElement(
                               "No more members available",
                             );
                           } else {
                             let availableMembers =
                               List.filter(
                                 member =>
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
                                      ),
                                 filteredList,
                               );
                             ReasonReact.arrayToElement(
                               Array.map(
                                 member =>
                                   <div
                                     className=(
                                       switch (self.state.selectedPlayer) {
                                       | Some(player) =>
                                         if (player##id == member##id) {
                                           Styles.activeSelectableItem;
                                         } else {
                                           Styles.selectableItem;
                                         }
                                       | None => Styles.selectableItem
                                       }
                                     )
                                     key=member##id
                                     onClick=(
                                       _event =>
                                         self.send(SetSelectedPlayer(member))
                                     )>
                                     <PlayerSlot player=member />
                                   </div>,
                                 Array.of_list(availableMembers),
                               ),
                             );
                           };
                         | Error(error) =>
                           Js.log(error);
                           ReasonReact.nullElement;
                         }
                     )
                </FetchOrganization>
              </div>
            </div>
            <div className=Styles.dialogFooter>
              <button onClick=onClose>
                (ReasonReact.stringToElement("Cancel"))
              </button>
              (
                switch (self.state.selectedPlayer) {
                | Some(player) =>
                  <button
                    disabled=false
                    onClick=(
                      event => {
                        onSelect(player);
                        onClose(event);
                      }
                    )>
                    (ReasonReact.stringToElement("Select"))
                  </button>
                | None =>
                  <button disabled=true>
                    (ReasonReact.stringToElement("Select"))
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
      ~registeredPlayers,
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
            registeredPlayers
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
      ~registeredPlayers=jsProps##registeredPlayers,
      ~onSelect=jsProps##onSelect,
      ~onClose=jsProps##onClose,
      ~fallbackOrganizationKey=jsProps##fallbackOrganizationKey,
      [||],
    )
  );