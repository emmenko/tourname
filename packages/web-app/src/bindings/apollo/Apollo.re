type graphqlConfig = {. "url": string};

type dataObject = {
  .
  "__typename": string,
  "id": string,
  "key": string
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

[@bs.module "../../config.js"]
external config : graphqlConfig = "GRAPHQL_CONFIG";

[@bs.module "apollo-client"] [@bs.new]
external apolloClient : clientOptions => ApolloClient.generatedApolloClient =
  "ApolloClient";

[@bs.module "apollo-cache-inmemory"] [@bs.new]
external inMemoryCache : option(inMemoryCacheConfig) => 'a = "InMemoryCache";

[@bs.module "apollo-link-http"] [@bs.new]
external createHttpLink : ApolloClient.linkOptions => apolloLink = "HttpLink";

[@bs.module "apollo-link"] [@bs.new]
external createApolloLink :
  (
    (~operation: apolloLinkOperation, ~forward: apolloLinkForward) => apolloLink
  ) =>
  apolloLink =
  "ApolloLink";

[@bs.module "apollo-link"] external apolloLinkFrom : apolloLinkFrom = "from";

[@bs.module "apollo-link-error"]
external apolloLinkOnError : (apolloLinkErrorResponse => unit) => apolloLink =
  "onError";

module type HttpLinkConfig = {let uri: string;};

module CreateHttpLink = (Config: HttpLinkConfig) => {
  let link = createHttpLink({"uri": Config.uri});
};

module type ApolloLinkConfig = {
  let requestHandler:
    (~operation: apolloLinkOperation, ~forward: apolloLinkForward) =>
    apolloLink;
};

module CreateApolloLink = (Config: ApolloLinkConfig) => {
  let link = createApolloLink(Config.requestHandler);
};

module type ErrorLinkConfig = {
  let errorHandler: apolloLinkErrorResponse => unit;
};

module CreateErrorLink = (Config: ErrorLinkConfig) => {
  let link = apolloLinkOnError(Config.errorHandler);
};

module type ApolloClientConfig = {
  let links: array(apolloLink);
  let inMemoryCacheConfig: option(inMemoryCacheConfig);
};

module CreateClient = (Config: ApolloClientConfig) => {
  let apolloClientOptions: clientOptions = {
    "cache": inMemoryCache(Config.inMemoryCacheConfig),
    "link": apolloLinkFrom(Config.links)
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

/* Setup client */
module HttpLink =
  CreateHttpLink(
    {
      let uri = config##url;
    }
  );

module AuthLink =
  CreateApolloLink(
    {
      let requestHandler = (~operation, ~forward) => {
        let token = ReasonAuth.getAccessToken();
        let headers = {
          "headers": {
            "authorization": {j|Bearer $token|j}
          }
        };
        operation##setContext(headers);
        forward(operation);
      };
    }
  );

module ErrorLink =
  CreateErrorLink(
    {
      let errorHandler = errorResponse =>
        if (Js_option.isSome(errorResponse##networkError)
            &&
            Js_option.getExn(errorResponse##networkError)##statusCode === 401) {
          ReasonAuth.logout();
        } else {
          ();
        };
    }
  );

module Client =
  CreateClient(
    {
      let links = [|AuthLink.link, ErrorLink.link, HttpLink.link|];
      let inMemoryCacheConfig =
        Some({
          "dataIdFromObject": (obj: dataObject) =>
            if (obj##__typename === "Organization") {
              obj##key;
            } else {
              obj##id;
            }
        });
    }
  );

let default = Client.apolloClient;