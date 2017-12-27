module OrganizationKeyCheck = Apollo.Client.Query(OrganizationKeyCheckQuery);

let component =
  ReasonReact.statelessComponentWithRetainedProps("OrganizationKeyCheck");

let make = (~value, ~onChange, _children) => {
  let variables = {"key": value};
  {
    ...component,
    retainedProps: value,
    /* Only re-render if the value changed, to prevent infinite re-renders */
    shouldUpdate: ({oldSelf}) => oldSelf.retainedProps !== value,
    render: _self =>
      <OrganizationKeyCheck variables>
        (
          response =>
            switch response {
            | Loading => ReasonReact.stringToElement("...")
            | Failed(error) =>
              Js.log2("[KeyCheck] Error while fetching", error);
              ReasonReact.nullElement;
            | Loaded(result) =>
              let isOrganizationKeyUsed = result##isOrganizationKeyUsed;
              <KeyCheckHandler isOrganizationKeyUsed onChange />;
            }
        )
      </OrganizationKeyCheck>
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~value=jsProps##value, ~onChange=jsProps##onChange, [||])
  );