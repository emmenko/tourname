open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let view = css([Selector("> * + *", [margin("16px 0 0")])]);
  let section = css([display("flex"), justifyContent("space-between")]);
  let sectionBlock = css([flex("1")]);
  let textPrimary = css([fontSize("1.25rem"), fontWeight("bold")]);
  let textDetail = css([fontSize("0.9rem"), color("#aaa")]);
};

type tournamentShape = {
  .
  "id": string,
  "discipline": string,
  "name": string,
  "status": string,
  "size": int,
  "teamSize": int,
};

module ActiveTournamentsQuery = [%graphql
  {|
  query ActiveTournaments($key: String!, $page: Int!, $perPage: Int!) {
    organization(key: $key) {
      key
      tournaments(
        status: [NEW, IN_PROGRESS]
        sort: { key: "createdAt", order: DESC }
        page: $page
        perPage: $perPage
      ) {
        id
        discipline
        name
        status
        size
        teamSize
      }
    }
  }
|}
];

module FetchActiveTournaments =
  ReasonApollo.CreateQuery(ActiveTournamentsQuery);

module FinishedTournamentsQuery = [%graphql
  {|
  query FinishedTournaments($key: String!, $page: Int!, $perPage: Int!) {
    organization(key: $key) {
      key
      tournaments(
        status: [FINISHED]
        sort: { key: "createdAt", order: DESC }
        page: $page
        perPage: $perPage
      ) {
        id
        discipline
        name
        status
        size
        teamSize
      }
    }
  }
|}
];

module FetchFinishedTournaments =
  ReasonApollo.CreateQuery(FinishedTournamentsQuery);

module RouterMatch =
  SpecifyRouterMatch(
    {
      type params = {. "organizationKey": string};
    },
  );

let component = ReasonReact.statelessComponent("Dashboard");

let make = (~match: RouterMatch.match, _children) => {
  let organizationKey = match##params##organizationKey;
  let renderTournamentsList =
      (
        ~tournaments: array(tournamentShape),
        ~organizationKey,
        ~labelEmptyList,
      ) =>
    if (Array.length(tournaments) == 0) {
      <div> (ReasonReact.stringToElement(labelEmptyList)) </div>;
    } else {
      <ul>
        (
          ReasonReact.arrayToElement(
            Array.map(
              tournament => {
                let tournamentId = tournament##id;
                <Link
                  key=tournament##id
                  to_={j|/$organizationKey/tournament/$tournamentId|j}>
                  <li>
                    <div className=Styles.textPrimary>
                      (ReasonReact.stringToElement(tournament##name))
                    </div>
                    <div className=Styles.textDetail>
                      (ReasonReact.stringToElement(tournament##discipline))
                    </div>
                  </li>
                </Link>;
              },
              tournaments,
            ),
          )
        )
      </ul>;
    };
  {
    ...component,
    render: _self => {
      let activeTournamentsQuery =
        ActiveTournamentsQuery.make(
          ~key=organizationKey,
          ~page=1,
          ~perPage=20,
          (),
        );
      let finishedTournamentsQuery =
        FinishedTournamentsQuery.make(
          ~key=organizationKey,
          ~page=1,
          ~perPage=20,
          (),
        );
      <div className=Styles.view>
        <div className=Styles.section>
          <FetchUser>
            ...(
                 ({result}) =>
                   switch (result) {
                   | NoData => ReasonReact.stringToElement("No data...")
                   | Loading => <Welcome />
                   | Error(error) =>
                     Js.log(error);
                     ReasonReact.nullElement;
                   | Data(response) => <Welcome name=response##me##name />
                   }
               )
          </FetchUser>
        </div>
        <div className=Styles.section>
          <div className=Styles.sectionBlock>
            <h3> (ReasonReact.stringToElement("Active tournaments")) </h3>
            <FetchActiveTournaments
              variables=activeTournamentsQuery##variables>
              ...(
                   ({result}) =>
                     switch (result) {
                     | NoData => ReasonReact.stringToElement("No data...")
                     | Loading => <LoadingSpinner />
                     | Error(error) =>
                       Js.log(error);
                       ReasonReact.nullElement;
                     | Data(response) =>
                       let tournaments = response##organization##tournaments;
                       renderTournamentsList(
                         ~labelEmptyList=
                           "There are no active tournaments at the moment",
                         ~tournaments,
                         ~organizationKey,
                       );
                     }
                 )
            </FetchActiveTournaments>
          </div>
          <div className=Styles.sectionBlock>
            <h3> (ReasonReact.stringToElement("Finished tournaments")) </h3>
            <FetchFinishedTournaments
              variables=finishedTournamentsQuery##variables>
              ...(
                   ({result}) =>
                     switch (result) {
                     | NoData => ReasonReact.stringToElement("No data...")
                     | Loading => <LoadingSpinner />
                     | Error(error) =>
                       Js.log(error);
                       ReasonReact.nullElement;
                     | Data(response) =>
                       let tournaments = response##organization##tournaments;
                       renderTournamentsList(
                         ~labelEmptyList=
                           "There are no active tournaments at the moment",
                         ~tournaments,
                         ~organizationKey,
                       );
                     }
                 )
            </FetchFinishedTournaments>
          </div>
        </div>
        <div className=Styles.section>
          <Link to_="/new">
            (ReasonReact.stringToElement("Create new tournament"))
          </Link>
        </div>
      </div>;
    },
  };
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~match=jsProps##_match, [||])
  );