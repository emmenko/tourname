type errorObj = {. "message": string};

type networkErrorResult = {. "errors": Js.Nullable.t(array(errorObj))};

type networkError = {
  .
  "statusCode": int,
  "result": networkErrorResult,
};

external toNetworkError : 'a => Js.Nullable.t(networkError) = "%identity";

let component = ReasonReact.statelessComponent("NetworkErrorMessage");

/* FIXME: in `ReasonApolloTypes`, the `apolloError` defines the `networkError`
   type as a `string`, instead it should be an object with fields like `result`,
   `errors`, etc.
   To work around this, we cast it to our specific record types. */
let make = (~error: Js.Nullable.t(string), _children) => {
  ...component,
  render: _self => {
    let error = toNetworkError(error);
    let ne = Js.Nullable.toOption(error);
    switch (ne) {
    | Some(e) =>
      let nere = Js.Nullable.toOption(e##result##errors);
      switch (nere) {
      | Some(es) =>
        /* TODO:
           - style error message box
           - put general error message based on statusCode (e.g. 400)
           - collapse error details
           */
        <ul>
          (
            es
            |> Array.map(o => <li> (o##message |> ReasonReact.string) </li>)
            |> ReasonReact.array
          )
        </ul>
      | None => ReasonReact.null
      };
    | None => ReasonReact.null
    };
  },
};