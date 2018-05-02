open ReasonReactRouterDom;

module MatchDetailQuery = [%graphql
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
        key
        players {
          id
          email
          name
          picture
        }
      }
      teamRight {
        key
        players {
          id
          email
          name
          picture
        }
      }
      winner {
        key
        players {
          id
          email
          name
          picture
        }
      }
    }
  }
|}
];

module FetchMatchDetail = ReasonApollo.CreateQuery(MatchDetailQuery);

module RouterMatch =
  SpecifyRouterMatch(
    {
      type params = {
        .
        "organizationKey": string,
        "matchId": string,
      };
    },
  );

let component = ReasonReact.statelessComponent("Dashboard");

let make = (~match: RouterMatch.match, _children) => {
  /* let organizationKey = match##params##organizationKey; */
  let matchId = match##params##matchId;
  {
    ...component,
    render: _self => {
      let matchDetailQuery = MatchDetailQuery.make(~id=matchId, ());
      <FetchMatchDetail variables=matchDetailQuery##variables>
        ...(
             ({result}) =>
               switch (result) {
               | NoData => ReasonReact.stringToElement("No data...")
               | Loading => <LoadingSpinner />
               | Error(error) =>
                 Js.log(error);
                 ReasonReact.nullElement;
               | Data(_response) =>
                 <span>
                   (
                     ReasonReact.stringToElement(
                       {j|Detail page of match $matchId|j},
                     )
                   )
                 </span>
               }
           )
      </FetchMatchDetail>;
    },
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );