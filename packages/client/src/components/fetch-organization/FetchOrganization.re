module OrganizationQuery = [%graphql
  {|
  query OrganizationQuery($key: String!) {
    organization(key: $key) {
      key
      name
    }
  }
|}
];

module FetchOrganization = ReasonApollo.CreateQuery(OrganizationQuery);

let component = ReasonReact.statelessComponent("FetchOrganization");

let make = FetchOrganization.make;