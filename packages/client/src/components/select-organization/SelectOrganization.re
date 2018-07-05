open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let view = css([select("> * + *", [marginTop(px(16))])]);
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
      if (Array.length(availableOrganizations) === 1) {
        let target = availableOrganizations[0]##key;
        <Redirect to_={j|/$target|j} />;
      } else {
        <div className=(Styles.view |> TypedGlamor.toString)>
          <h2>
            ("Select an organization from the list" |> ReasonReact.string)
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
                availableOrganizations
                |> Array.map(org =>
                     <option key=org##key value=org##key>
                       (org##name |> ReasonReact.string)
                     </option>
                   )
                |> ReasonReact.array;
              } else {
                <option disabled=true>
                  ("Loading..." |> ReasonReact.string)
                </option>;
              }
            )
          </select>
        </div>;
      },
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
                     ReasonReact.null;
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
