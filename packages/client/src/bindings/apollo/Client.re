/**
 * A convenience method to cast a generic type to a record object.
 */
external asJsObject : 'a => Js.t({..}) = "%identity";

external apolloErrorToJsError : ReasonApolloTypes.apolloError => Js.Exn.t =
  "%identity";

type graphqlConfig = {. "url": string};

[@bs.module "../../config.js"]
external config : graphqlConfig = "GRAPHQL_CONFIG";

/* Create an InMemoryCache */
type dataObject = {
  .
  "__typename": Js.Nullable.t(string),
  "id": Js.Nullable.t(string),
  "key": Js.Nullable.t(string),
};

let formatDataId = (~typename, ~id) => typename ++ ":" ++ id;

let dataIdFromObject = (obj: dataObject) =>
  switch (obj##__typename |> Js.Nullable.toOption) {
  | Some(t) =>
    if (t == "Organization") {
      switch (obj##key |> Js.Nullable.toOption) {
      | Some(k) => formatDataId(~typename=t, ~id=k)
      | None =>
        Js.log(
          "Expected a 'key' field in the 'Organization' type, falling back to only '__typename' as the cache key.",
        );
        t;
      };
    } else {
      switch (obj##id |> Js.Nullable.toOption) {
      | Some(i) => t ++ ":" ++ i
      | None => ""
      };
    }
  | None =>
    switch (obj##id |> Js.Nullable.toOption, obj##key |> Js.Nullable.toOption) {
    | (Some(i), _) =>
      Js.log("Missing '__typename' field, using 'id' as the cache key");
      i;
    | (None, Some(k)) =>
      Js.log("Missing '__typename' field, using 'key' as the cache key");
      k;
    | (None, None) =>
      Js.log(
        "Missing '__typename' field and both 'id' and 'key', falling back to empty string as the cache key",
      );
      "";
    }
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