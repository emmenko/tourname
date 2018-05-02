type member = {
  .
  "id": string,
  "createdAt": string,
  "email": string,
  "name": string,
  "picture": string,
  "isAdmin": bool,
};

module OrganizationQuery = [%graphql
  {|
  query OrganizationQuery($key: String!) {
    organization(key: $key) {
      key
      name
      members {
        id
        createdAt
        lastModifiedAt
        email
        name
        picture
        isAdmin
      }
    }
  }
|}
];

module FetchOrganization = ReasonApollo.CreateQuery(OrganizationQuery);

let component = ReasonReact.statelessComponent("FetchOrganization");

let make = FetchOrganization.make;