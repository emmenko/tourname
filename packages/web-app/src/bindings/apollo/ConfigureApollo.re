type graphqlConfig = {. "url": string};

[@bs.module "../../config.js"]
external config : graphqlConfig = "GRAPHQL_CONFIG";

/* Setup client */
module HttpLink =
  ApolloLinks.CreateHttpLink(
    {
      let uri = config##url;
    }
  );

module AuthLink =
  ApolloLinks.CreateContextLink(
    {
      let contextHandler = () => {
        let token = ReasonAuth.getAccessToken();
        let headers = {
          "headers": {
            "authorization": {j|Bearer $token|j}
          }
        };
        ApolloLinks.asJsObject(headers);
      };
    }
  );

module ErrorLink =
  ApolloLinks.CreateErrorLink(
    {
      let errorHandler = errorResponse =>
        switch errorResponse##networkError {
        | Some(error) =>
          if (error##statusCode == 401) {
            ReasonAuth.logout();
          } else {
            ();
          }
        | None => ()
        };
    }
  );

module InMemoryCache =
  Apollo.CreateInMemoryCache(
    {
      type dataObject = {
        .
        "__typename": string,
        "id": string,
        "key": string
      };
      let inMemoryCacheObject =
        Js_null_undefined.return({
          "dataIdFromObject": (obj: dataObject) =>
            if (obj##__typename === "Organization") {
              obj##key;
            } else {
              obj##id;
            }
        });
    }
  );

module Client =
  Apollo.CreateClient(
    {
      let links = [|AuthLink.link, ErrorLink.link, HttpLink.link|];
      let cache = InMemoryCache.cache;
    }
  );

let default = Client.apolloClient;