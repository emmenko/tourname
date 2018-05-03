type member = {
  .
  "createdAt": string,
  "email": string,
  "id": string,
  "isAdmin": Js.boolean,
  "lastModifiedAt": string,
  "name": string,
  "picture": string,
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