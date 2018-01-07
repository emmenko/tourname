module OrganizationKeyCheckQuery = {
  [@bs.module "graphql-tag"] external gql : ReasonApolloTypes.gql = "default";
  let query =
    [@bs]
    gql(
      {|
  query CheckOrganizationKey($key: String!) {
    isOrganizationKeyUsed(key: $key)
  }
|}
    );
  type data = {. "isOrganizationKeyUsed": bool};
  type response = data;
  type variables = {. "key": string};
};

module OrganizationKeyCheck =
  ConfigureApollo.Client.Query(OrganizationKeyCheckQuery);

module KeyCheckHandler = {
  let component = ReasonReact.statelessComponent("KeyCheckHandler");
  let make = (~isOrganizationKeyUsed, ~onChange, _children) => {
    ...component,
    /* Since the Apollo query is triggered using a declarative component we need
       to use a child component to trigger `onChange` updates each time the query
       returns a result */
    didUpdate: _oldAndNewSelf => {
      onChange(! isOrganizationKeyUsed);
      ();
    },
    render: _self => {
      let hintText = if (isOrganizationKeyUsed) {"NO"} else {"OK"};
      ReasonReact.stringToElement(hintText);
    }
  };
};

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