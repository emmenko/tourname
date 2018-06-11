/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type role = [ | `Admin | `Member];

type member = {
  id: string,
  auth0Id: string,
  email: string,
  name: string,
  picture: string,
  role: role,
};

module FetchMemberQuery = [%graphql
  {|
  query MemberQuery($id: ID!, $organizationKey: String!) {
    member(id: $id, organizationKey: $organizationKey) @bsRecord {
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

module FetchMember = ReasonApollo.CreateQuery(FetchMemberQuery);

let component = ReasonReact.statelessComponent("FetchMember");

let make = FetchMember.make;