module FetchMembersQuery = [%graphql
  {|
  query MembersQuery($organizationKey: String!) {
    members(organizationKey: $organizationKey) {
      id
      auth0Id
      email
      name
      picture
      role
    }
  }
|}
];

module FetchMembers = ReasonApollo.CreateQuery(FetchMembersQuery);

let component = ReasonReact.statelessComponent("FetchMembers");

let make = FetchMembers.make;