/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type role = [ | `Admin | `Member];

type member = {
  .
  "id": string,
  "auth0Id": string,
  "email": string,
  "name": string,
  "picture": string,
  "role": role,
};

module OrganizationQuery = [%graphql
  {|
  query OrganizationQuery($key: String!) {
    organization(key: $key) {
      key
      name
      members {
        id
        auth0Id
        email
        name
        picture
        role
      }
    }
  }
|}
];

module FetchOrganization = ReasonApollo.CreateQuery(OrganizationQuery);

let component = ReasonReact.statelessComponent("FetchOrganization");

let make = FetchOrganization.make;