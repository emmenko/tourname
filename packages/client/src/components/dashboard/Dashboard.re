open TypedGlamor;

open ReasonReactRouterDom;

module Styles = {
  let view = css([select("> * + *", [marginTop(px(16))])]);
  let section = css([display(flex), justifyContent(spaceBetween)]);
  let sectionBlock = css([flex_(int(1))]);
  let textPrimary = css([fontSize(rem(1.25)), fontWeight(bold)]);
  let textDetail = css([fontSize(rem(0.9)), color(hex("aaa"))]);
};

/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type discipline = [ | `PoolTable | `TableTennis];

module ActiveTournamentsQuery = [%graphql
  {|
  query ActiveTournaments($key: String!, $page: Int!, $perPage: Int!) {
    tournaments(
      organizationKey: $key
      status: [New, InProgress]
      orderBy: createdAt_DESC
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
|}
];

module FetchActiveTournaments =
  ReasonApollo.CreateQuery(ActiveTournamentsQuery);

module FinishedTournamentsQuery = [%graphql
  {|
  query FinishedTournaments($key: String!, $page: Int!, $perPage: Int!) {
    tournaments(
      organizationKey: $key
      status: [Finished]
      orderBy: createdAt_DESC
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
      (~tournaments=?, ~organizationKey, ~labelEmptyList, ()) =>
    switch (tournaments) {
    | None => <div> (ReasonReact.stringToElement(labelEmptyList)) </div>
    | Some(listOfTournaments) =>
      if (Js.Array.length(listOfTournaments) == 0) {
        <div> (ReasonReact.stringToElement(labelEmptyList)) </div>;
      } else {
        <ul>
          (
            listOfTournaments
            |> Js.Array.map(tournament => {
                 let tournamentId = tournament##id;
                 <Link
                   key=tournament##id
                   to_={j|/$organizationKey/tournament/$tournamentId|j}>
                   <li>
                     <div
                       className=(Styles.textPrimary |> TypedGlamor.toString)>
                       (ReasonReact.stringToElement(tournament##name))
                     </div>
                     <div
                       className=(Styles.textDetail |> TypedGlamor.toString)>
                       (
                         ReasonReact.stringToElement(
                           disciplineToJs(tournament##discipline),
                         )
                       )
                     </div>
                   </li>
                 </Link>;
               })
            |> ReasonReact.arrayToElement
          )
        </ul>;
      }
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
      <div className=(Styles.view |> TypedGlamor.toString)>
        <div className=(Styles.section |> TypedGlamor.toString)>
          <FetchUser>
            ...(
                 ({result}) =>
                   switch (result) {
                   | Loading => <Welcome />
                   | Error(error) =>
                     Js.log(error);
                     ReasonReact.nullElement;
                   | Data(response) => <Welcome name=response##me##name />
                   }
               )
          </FetchUser>
        </div>
        <div className=(Styles.section |> TypedGlamor.toString)>
          <div className=(Styles.sectionBlock |> TypedGlamor.toString)>
            <h3> (ReasonReact.stringToElement("Active tournaments")) </h3>
            <FetchActiveTournaments
              variables=activeTournamentsQuery##variables>
              ...(
                   ({result}) =>
                     switch (result) {
                     | Loading => <LoadingSpinner />
                     | Error(error) =>
                       <NetworkErrorMessage error=error##networkError />
                     | Data(response) =>
                       if (Array.length(response##tournaments) == 0) {
                         renderTournamentsList(
                           ~labelEmptyList=
                             "There are no active tournaments at the moment",
                           ~organizationKey,
                           (),
                         );
                       } else {
                         renderTournamentsList(
                           ~labelEmptyList=
                             "There are no active tournaments at the moment",
                           ~tournaments=response##tournaments,
                           ~organizationKey,
                           (),
                         );
                       }
                     }
                 )
            </FetchActiveTournaments>
          </div>
          <div className=(Styles.sectionBlock |> TypedGlamor.toString)>
            <h3> (ReasonReact.stringToElement("Finished tournaments")) </h3>
            <FetchFinishedTournaments
              variables=finishedTournamentsQuery##variables>
              ...(
                   ({result}) =>
                     switch (result) {
                     | Loading => <LoadingSpinner />
                     | Error(error) =>
                       <NetworkErrorMessage error=error##networkError />
                     | Data(response) =>
                       if (Array.length(response##tournaments) == 0) {
                         renderTournamentsList(
                           ~labelEmptyList=
                             "There are no finished tournaments at the moment",
                           ~organizationKey,
                           (),
                         );
                       } else {
                         renderTournamentsList(
                           ~labelEmptyList=
                             "There are no finished tournaments at the moment",
                           ~tournaments=response##tournaments,
                           ~organizationKey,
                           (),
                         );
                       }
                     }
                 )
            </FetchFinishedTournaments>
          </div>
        </div>
        <div className=(Styles.section |> TypedGlamor.toString)>
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