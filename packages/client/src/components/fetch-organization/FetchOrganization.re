module OrganizationQuery = [%graphql
  {|
  query OrganizationQuery($key: String!) {
    organization(key: $key) {
      key
      name
      memberRefs {
        id
      }
    }
  }
|}
];

module FetchOrganization = ReasonApollo.CreateQuery(OrganizationQuery);

let component = ReasonReact.statelessComponent("FetchOrganization");

let make = FetchOrganization.make;