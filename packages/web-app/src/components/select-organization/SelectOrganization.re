open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let view = css([Selector("> * + *", [margin("16px 0 0")])]);
};

type organization = {
  .
  "key": string,
  "name": string,
};

let getEventValue = event => ReactDOMRe.domElementToObj(
                               ReactEventRe.Form.target(event),
                             )##value;

module SelectOrganization = {
  let component =
    ReasonReact.statelessComponentWithRetainedProps("SelectOrganization");
  let make =
      (
        ~history: History.History.t,
        ~availableOrganizations: array(organization),
        _children,
      ) => {
    ...component,
    retainedProps: availableOrganizations,
    willUpdate: ({newSelf}) =>
      if (Array.length(newSelf.retainedProps) == 1) {
        let orgKey = newSelf.retainedProps[0]##key;
        History.History.push(history, ~url={j|/$orgKey|j}, ~state=[]);
      },
    render: _self =>
      <div className=Styles.view>
        <h2>
          (
            ReasonReact.stringToElement("Select an organization from the list")
          )
        </h2>
        <select
          onChange=(
            event => {
              let value = getEventValue(event);
              History.History.push(history, ~url={j|/$value|j}, ~state=[]);
            }
          )>
          (
            if (Array.length(availableOrganizations) > 0) {
              ReasonReact.arrayToElement(
                Array.map(
                  org =>
                    <option key=org##key value=org##key>
                      (ReasonReact.stringToElement(org##name))
                    </option>,
                  availableOrganizations,
                ),
              );
            } else {
              <option disabled=true>
                (ReasonReact.stringToElement("Loading..."))
              </option>;
            }
          )
        </select>
      </div>,
  };
};

let component = ReasonReact.statelessComponent("ConnectedSelectOrganization");

let make = _children => {
  ...component,
  render: _self =>
    <Route
      render=(
        renderProps =>
          <FetchUser>
            ...(
                 ({result}) =>
                   switch (result) {
                   | Loading =>
                     <SelectOrganization
                       history=renderProps##history
                       availableOrganizations=[||]
                     />
                   | Error(error) =>
                     Js.log(error);
                     ReasonReact.nullElement;
                   | Data(response) =>
                     <SelectOrganization
                       history=renderProps##history
                       availableOrganizations=response##me##availableOrganizations
                     />
                   }
               )
          </FetchUser>
      )
    />,
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));