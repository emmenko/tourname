type playerRef = {id: string};
type team = {
  id: string,
  size: int,
  playerRefs: list(playerRef),
};
type tournament = {
  id: string,
  createdAt: string,
  updatedAt: string,
  name: string,
  size: TournameTypes.tournamentSize,
  status: TournameTypes.tournamentStatus,
  discipline: TournameTypes.discipline,
  teamSize: int,
  teams: list(team),
};

external string_of_datetime : Js.Json.t => string = "%identity";

let optionArrayToList = values =>
  switch (values) {
  | Some(v) => v |> Array.to_list
  | None => []
  };

module FetchTournamentQuery = [%graphql
  {|
  query TournamentDetail($id: ID!, $organizationKey: String!) {
    tournament(id: $id, organizationKey: $organizationKey) @bsRecord {
      id
      createdAt @bsDecoder(fn: "string_of_datetime")
      updatedAt @bsDecoder(fn: "string_of_datetime")
      name
      size
      status
      discipline
      teamSize
      teams @bsRecord @bsDecoder(fn: "optionArrayToList") {
        id
        size
        playerRefs @bsRecord @bsDecoder(fn: "optionArrayToList") {
          id
        }
      }
    }
  }
|}
];

module FetchTournament = ReasonApollo.CreateQuery(FetchTournamentQuery);

let component = ReasonReact.statelessComponent("FetchTournament");

let make = FetchTournament.make;