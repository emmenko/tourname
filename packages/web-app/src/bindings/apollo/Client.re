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
  "__typename": string,
  "id": string,
  "key": string,
};

let dataIdFromObject = (obj: dataObject) =>
  if (obj##__typename === "Organization") {
    obj##key;
  } else {
    obj##id;
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
        "authorization": {j|Bearer $token|j},
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