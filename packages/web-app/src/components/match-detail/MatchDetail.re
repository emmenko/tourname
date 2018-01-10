open ReasonReactRouterDom;

module MatchDetailQuery = {
  [@bs.module "graphql-tag"] external gql : ReasonApolloTypes.gql = "default";
  let query =
    [@bs]
    gql(
      {|
  query MatchDetail($id: String!) {
    match(id: $id) {
      id
      createdAt
      lastModifiedAt
      discipline
      organizationKey
      tournamentId
      teamLeft {
        ...TeamInfo
      }
      teamRight {
        ...TeamInfo
      }
      winner {
        ...TeamInfo
      }
    }
  }
  fragment TeamInfo on Team {
    key
    players {
      id
      email
      name
      picture
    }
  }
|}
    );
  type players = {
    .
    "id": string,
    "email": string,
    "name": string,
    "picture": string
  };
  type team = {
    .
    "key": string,
    "players": array(players)
  };
  type matchShape = {
    .
    "id": string,
    "createdAt": string,
    "lastModifiedAt": string,
    "discipline": string,
    "organizationKey": string,
    "tournamentId": string,
    "teamLeft": team,
    "teamRight": team,
    "winner": team
  };
  type data = {. "match": matchShape};
  type response = data;
  type variables = {. "id": string};
};

module FetchMatchDetail = ConfigureApollo.Client.Query(MatchDetailQuery);

let component = ReasonReact.statelessComponent("Dashboard");

let make = (~match: match, _children) => {
  let organizationKey = Js.Dict.get(match##params, "organizationKey");
  let matchId = Js.Dict.get(match##params, "matchId");
  {
    ...component,
    render: _self =>
      switch organizationKey {
      | None =>
        Js.log("Error: organizationKey param is not defined!");
        /* Throw an error? */
        ReasonReact.nullElement;
      | Some(_orgKey) =>
        switch matchId {
        | None =>
          Js.log("Error: organizationKey param is not defined!");
          /* Throw an error? */
          ReasonReact.nullElement;
        | Some(id) =>
          <FetchMatchDetail variables={"id": id}>
            (
              response =>
                switch response {
                | Loading => <LoadingSpinner />
                | Failed(error) =>
                  Js.log(error);
                  ReasonReact.nullElement;
                | Loaded(_result) =>
                  <span>
                    (
                      ReasonReact.stringToElement(
                        {j|Detail page of match $id|j}
                      )
                    )
                  </span>
                }
            )
          </FetchMatchDetail>
        }
      }
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );