open Glamor;

open Formik;

open ReasonReactRouterDom;

module Styles = {
  let formView = css([Selector("> * + *", [margin("16px 0 0")])]);
};

module CreateOrganizationForm =
  CreateForm(
    {
      type valueTypes = {
        .
        "name": string,
        "key": string,
        "isValidKey": bool,
      };
    },
  );

let noWhitespacesRegex = [%bs.re "/\\s/g"];

external apolloErrorToJsError : ReasonApolloTypes.apolloError => Js.Exn.t =
  "%identity";

module CreateOrganizationMutation = [%graphql
  {|
  mutation CreateOrganization($key: String!, $name: String!) {
    createOrganization(key: $key, name: $name) {
      key
    }
  }
|}
];

module CreateOrganization =
  ReasonApollo.CreateMutation(CreateOrganizationMutation);

let renderErrorHint =
    (~errors: Js.Dict.t(string), ~touched: Js.Dict.t(string), ~key: string) =>
  switch (Js.Dict.get(touched, key)) {
  | Some(_) =>
    switch (Js.Dict.get(errors, key)) {
    | Some(errorMessage) =>
      <div> (ReasonReact.stringToElement(errorMessage)) </div>
    | None => ReasonReact.nullElement
    }
  | None => ReasonReact.nullElement
  };

let component = ReasonReact.statelessComponent("OrganizationCreate");

let make = _children => {
  ...component,
  render: _self =>
    <div className=Styles.formView>
      <div>
        (
          ReasonReact.stringToElement(
            "Create  a new organization (or ask to be invited to an existing organization)",
          )
        )
      </div>
      <CreateOrganization>
        ...(
             (mutation, mutationResult) => {
               let mutationResultComponent =
                 switch (mutationResult.result) {
                 | Loading
                 | NotCalled => ReasonReact.nullElement
                 | Error(error) =>
                   let errorMsg =
                     switch (Js.Exn.message(apolloErrorToJsError(error))) {
                     | Some(message) => {j|Mutation error: $message|j}
                     | None => "An unknown error occurred"
                     };
                   ReasonReact.stringToElement(errorMsg);
                 | Data(response) =>
                   switch (response##createOrganization) {
                   | Some(org) =>
                     let createOrganizationKey = org##key;
                     Js.log2("Organization created", createOrganizationKey);
                     <Redirect to_={j|/$createOrganizationKey|j} />;
                   | None => ReasonReact.nullElement
                   }
                 };
               <CreateOrganizationForm
                 initialValues=(
                   valuesToJsObject({
                     "name": "",
                     "key": "",
                     "isValidKey": false,
                   })
                 )
                 validate=(
                   values => {
                     Js.log2("validating values", values);
                     let errors = Js.Dict.empty();
                     if (values##name == "") {
                       Js.Dict.set(errors, "name", "Requried");
                     };
                     if (values##key == "") {
                       Js.Dict.set(errors, "key", "Requried");
                     } else if (Js.Re.test(values##key, noWhitespacesRegex)) {
                       Js.Dict.set(
                         errors,
                         "key",
                         "Key cannot have whitespaces",
                       );
                     } else if (! values##isValidKey) {
                       Js.Dict.set(
                         errors,
                         "key",
                         "Organization key already exists",
                       );
                     };
                     errors;
                   }
                 )
                 onSubmit=(
                   (values, formikActions) => {
                     let createOrganizationMutation =
                       CreateOrganizationMutation.make(
                         ~key=values##key,
                         ~name=values##name,
                         (),
                       );
                     mutation(
                       ~variables=createOrganizationMutation##variables,
                       (),
                     )
                     |> Js.Promise.then_(_rawResult => {
                          switch (mutationResult.result) {
                          | NotCalled
                          | Loading
                          | Data(_) => ()
                          /* Reset the form state only if the mutation did not succeeded */
                          | Error(_) =>
                            CreateOrganizationForm.FormikActions.setSubmitting(
                              formikActions,
                              false,
                            )
                          };
                          Js.Promise.resolve();
                        })
                     |> ignore;
                   }
                 )
                 render=(
                   t => {
                     let values =
                       CreateOrganizationForm.FormikProps.values(t);
                     let touched =
                       CreateOrganizationForm.FormikProps.touched(t);
                     let errors =
                       CreateOrganizationForm.FormikProps.errors(t);
                     <form
                       onSubmit=(
                         CreateOrganizationForm.FormikProps.handleSubmit(t)
                       )>
                       <div>
                         <label>
                           (ReasonReact.stringToElement("Name"))
                         </label>
                         <input
                           _type="text"
                           name="name"
                           onChange=(
                             CreateOrganizationForm.FormikProps.handleChange(
                               t,
                             )
                           )
                           onBlur=(
                             CreateOrganizationForm.FormikProps.handleBlur(t)
                           )
                           value=values##name
                         />
                         (renderErrorHint(~errors, ~touched, ~key="name"))
                       </div>
                       <div>
                         <label> (ReasonReact.stringToElement("Key")) </label>
                         <input
                           _type="text"
                           name="key"
                           onChange=(
                             CreateOrganizationForm.FormikProps.handleChange(
                               t,
                             )
                           )
                           onBlur=(
                             CreateOrganizationForm.FormikProps.handleBlur(t)
                           )
                           value=values##key
                         />
                         <OrganizationKeyCheck
                           onChange=(
                             isValidKey => {
                               Js.log2("Check key is valid", isValidKey);
                               CreateOrganizationForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="isValidKey",
                                 ~value=toAny(isValidKey),
                               );
                             }
                           )
                           value=values##key
                         />
                         (renderErrorHint(~errors, ~touched, ~key="key"))
                       </div>
                       <div>
                         {
                           let isValid =
                             CreateOrganizationForm.FormikProps.isValid(t);
                           let isSubmitting =
                             CreateOrganizationForm.FormikProps.isSubmitting(
                               t,
                             );
                           <button
                             _type="submit"
                             disabled=(! isValid || isSubmitting)>
                             (
                               ReasonReact.stringToElement(
                                 "Create organization",
                               )
                             )
                           </button>;
                         }
                       </div>
                       mutationResultComponent
                     </form>;
                   }
                 )
               />;
             }
           )
      </CreateOrganization>
    </div>,
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));