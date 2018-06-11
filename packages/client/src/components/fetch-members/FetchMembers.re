open FetchMember;

type members = list(member);

module FetchMembersQuery = [%graphql
  {|
  query MembersQuery($organizationKey: String!) {
    members(organizationKey: $key) @bsRecord @bsDecoder(fn: "Array.to_list") {
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