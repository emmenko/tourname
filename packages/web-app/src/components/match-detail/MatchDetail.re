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

module RouterMatch =
  SpecifyRouterMatch(
    {
      type params = {
        .
        "organizationKey": string,
        "matchId": string
      };
    }
  );

let component = ReasonReact.statelessComponent("Dashboard");

let make = (~match: RouterMatch.match, _children) => {
  /* let organizationKey = match##params##organizationKey; */
  let matchId = match##params##matchId;
  {
    ...component,
    render: _self =>
      <FetchMatchDetail variables={"id": matchId}>
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
                    {j|Detail page of match $matchId|j}
                  )
                )
              </span>
            }
        )
      </FetchMatchDetail>
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );