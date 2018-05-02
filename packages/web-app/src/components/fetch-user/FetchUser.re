module LoggedInUserQuery = [%graphql
  {|
  query LoggedInUser {
    me {
      id
      name
      email
      picture
      availableOrganizations {
        key
        name
      }
    }
  }
|}
];

module FetchLoggedInUser = ReasonApollo.CreateQuery(LoggedInUserQuery);

let component = ReasonReact.statelessComponent("FetchUser");

let make = FetchLoggedInUser.make;