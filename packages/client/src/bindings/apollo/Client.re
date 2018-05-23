/**
 * A convenience method to cast a generic type to a record object.
 */
external asJsObject : 'a => Js.t({..}) = "%identity";

type graphqlConfig = {. "url": string};

[@bs.module "../../config.js"]
external config : graphqlConfig = "GRAPHQL_CONFIG";

/* Create an InMemoryCache */
type dataObject = {
  .
  "__typename": option(string),
  "id": option(string),
  "key": option(string),
};

let dataIdFromObject = (obj: dataObject) =>
  switch (obj##__typename) {
  | Some("Organization") =>
    switch (obj##key) {
    | Some(k) => k
    | None =>
      Js.log("Expected a 'key' field in the 'Organization' type");
      "";
    }
  | Some(t) =>
    switch (obj##id) {
    | Some(i) => t ++ ":" ++ i
    | None => ""
    }
  | None => ""
  };

let inMemoryCache =
  ApolloInMemoryCache.createInMemoryCache(~dataIdFromObject, ());

/* Create an HTTP Link */
let httpLink = ApolloLinks.createHttpLink(~uri=config##url, ());

/* Create an Auth Link */
let authLink =
  ApolloLinks.createContextLink(() => {
    let token = ReasonAuth.getAccessToken();
    let headers = {
      "headers": {
        "authorization": "Bearer " ++ token,
      },
    };
    asJsObject(headers);
  });

/* Create an Error Link */
let errorLink =
  ApolloLinks.createErrorLink(errorResponse =>
    switch (Js.Nullable.toOption(errorResponse##networkError)) {
    | Some(error) =>
      if (error##statusCode == 401) {
        ReasonAuth.logout();
      } else {
        ();
      }
    | None => ()
    }
  );

let link = ApolloLinks.from([|authLink, errorLink, httpLink|]);

let instance =
  ReasonApollo.createApolloClient(~link, ~cache=inMemoryCache, ());