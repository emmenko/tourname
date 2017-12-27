type graphqlConfig = {. "url": string};

type dataObject = {
  .
  "__typename": string,
  "id": string,
  "key": string
};

type authShape = {
  .
  "getAccessToken": [@bs.meth] (unit => string),
  "logout": [@bs.meth] (unit => unit)
};

type inMemoryCacheConfig = {. "dataIdFromObject": dataObject => string};

type apolloLink;

type authorization = {. "authorization": string};

type headers = {. "headers": authorization};

type apolloLinkOperation = {. "setContext": [@bs.meth] (headers => unit)};

type apolloLinkForward = apolloLinkOperation => apolloLink;

type apolloLinkFrom = array(apolloLink) => apolloLink;

type networkError = {. "statusCode": int};

type apolloLinkErrorResponse = {. "networkError": option(networkError)};

type clientOptions = {
  .
  "cache": unit,
  "link": apolloLink
};

[@bs.module "./config.js"] external config : graphqlConfig = "GRAPHQL_CONFIG";

[@bs.module "./auth"] external auth : authShape = "default";

[@bs.module "apollo-client"] [@bs.new]
external apolloClient : clientOptions => ApolloClient.generatedApolloClient =
  "ApolloClient";

[@bs.module "apollo-cache-inmemory"] [@bs.new]
external inMemoryCache : inMemoryCacheConfig => 'a = "InMemoryCache";

[@bs.module "apollo-link-http"] [@bs.new]
external createHttpLink : ApolloClient.linkOptions => apolloLink = "HttpLink";

[@bs.module "apollo-link"] [@bs.new]
external createApolloLink :
  (
    (~operation: apolloLinkOperation, ~forward: apolloLinkForward) => apolloLink
  ) =>
  apolloLink =
  "ApolloLink";

[@bs.module "apollo-link"] [@bs]
external apolloLinkFrom : apolloLinkFrom = "from";

[@bs.module "apollo-link-error"]
external apolloLinkOnError : (apolloLinkErrorResponse => unit) => apolloLink =
  "onError";

module Client = {
  let httpLinkOptions: ApolloClient.linkOptions = {"uri": config##url};
  let linkHttp = createHttpLink(httpLinkOptions);
  let linkAuth =
    createApolloLink((~operation, ~forward) => {
      let token = auth##getAccessToken();
      let headers = {
        "headers": {
          "authorization": {j|Bearer $token|j}
        }
      };
      operation##setContext(headers);
      forward(operation);
    });
  let linkError =
    apolloLinkOnError(errorResponse =>
      if (Js_option.isSome(errorResponse##networkError)
          && Js_option.getExn(errorResponse##networkError)##statusCode === 401) {
        auth##logout();
      } else {
        ();
      }
    );
  let link = apolloLinkFrom([|linkAuth, linkError, linkHttp|]);
  let apolloClientOptions: clientOptions = {
    "cache":
      inMemoryCache({
        "dataIdFromObject": (obj: dataObject) =>
          if (obj##__typename === "Organization") {
            obj##key;
          } else {
            obj##id;
          }
      }),
    "link": link
  };
  let apolloClient = apolloClient(apolloClientOptions);
  module Query =
    ReasonApolloQuery.QueryFactory(
      {
        let apolloClient = apolloClient;
      }
    );
  module Mutation =
    ReasonApolloMutation.MutationFactory(
      {
        let apolloClient = apolloClient;
      }
    );
};

let default = Client.apolloClient;