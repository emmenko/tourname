[@bs.module] external gql : ReasonApolloTypes.gql = "graphql-tag";

let query = [@bs] gql({|
  query CheckOrganizationKey($key: String!) {
    isOrganizationKeyUsed(key: $key)
  }
|});

type data = {. "isOrganizationKeyUsed": bool };
type response = data;

type variables = {. "key": string };