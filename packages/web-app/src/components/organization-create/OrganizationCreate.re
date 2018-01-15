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
        "isValidKey": bool
      };
    }
  );

let noWhitespacesRegex = [%bs.re "/\\s/g"];

module CreateOrganizationMutation = {
  [@bs.module "graphql-tag"] external gql : ReasonApolloTypes.gql = "default";
  let mutation =
    [@bs]
    gql(
      {|
    mutation CreateOrganization($key: String!, $name: String!) {
      createOrganization(key: $key, name: $name) {
        key
      }
    }
  |}
    );
  type organization = {. "key": string};
  type data = {. "createOrganization": organization};
  type response = data;
  type variables = {
    .
    "key": string,
    "name": string
  };
};

module CreateOrganization =
  ConfigureApollo.Client.Mutation(CreateOrganizationMutation);

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

module OrganizationCreate = {
  let component = ReasonReact.statelessComponent("OrganizationCreate");
  let make = (~history: History.History.t, _children) => {
    ...component,
    render: _self =>
      <div className=Styles.formView>
        <div>
          (
            ReasonReact.stringToElement(
              "Create  a new organization (or ask to be invited to an existing organization)"
            )
          )
        </div>
        <CreateOrganizationForm
          initialValues=(
            valuesToJsObject({"name": "", "key": "", "isValidKey": Js.false_})
          )
          validate=(
            values => {
              let errors = Js.Dict.empty();
              if (values##name == "") {
                Js.Dict.set(errors, "name", "Requried");
              };
              if (values##key == "") {
                Js.Dict.set(errors, "key", "Requried");
              } else if (Js.Re.test(values##key, noWhitespacesRegex)) {
                Js.Dict.set(errors, "key", "Key cannot have whitespaces");
              } else if (! values##isValidKey) {
                Js.Dict.set(errors, "key", "Organization key already exists");
              };
              errors;
            }
          )
          onSubmit=(
            (values, formikActions) =>
              /* NOTE: manually execute the query in order to have control over
                 the callback response and do some side effects like updating the
                 form with `setSubmitting` */
              CreateOrganization.sendMutation(
                ~mutation=CreateOrganizationMutation.mutation,
                ~variables=Some({"key": values##key, "name": values##name}),
                ~reduce=getResult => {
                  let result = getResult();
                  switch result {
                  | Result(r) =>
                    let typedResult = CreateOrganization.cast(r)##data;
                    let createOrganizationKey = typedResult##createOrganization##key;
                    Js.log2("Organization created", createOrganizationKey);
                    CreateOrganizationForm.FormikActions.setSubmitting(
                      formikActions,
                      false
                    );
                    History.History.push(
                      history,
                      ~url={j|/$createOrganizationKey|j},
                      ~state=[]
                    );
                    ();
                  | Error(e) =>
                    Js.log(e);
                    CreateOrganizationForm.FormikActions.setSubmitting(
                      formikActions,
                      false
                    );
                  };
                  () => ();
                }
              )
          )
          render=(
            t => {
              let values = CreateOrganizationForm.FormikProps.values(t);
              let touched = CreateOrganizationForm.FormikProps.touched(t);
              let errors = CreateOrganizationForm.FormikProps.errors(t);
              <form
                onSubmit=(CreateOrganizationForm.FormikProps.handleSubmit(t))>
                <div>
                  <label> (ReasonReact.stringToElement("Name")) </label>
                  <input
                    _type="text"
                    name="name"
                    onChange=(
                      CreateOrganizationForm.FormikProps.handleChange(t)
                    )
                    onBlur=(CreateOrganizationForm.FormikProps.handleBlur(t))
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
                      CreateOrganizationForm.FormikProps.handleChange(t)
                    )
                    onBlur=(CreateOrganizationForm.FormikProps.handleBlur(t))
                    value=values##key
                  />
                  <OrganizationKeyCheck
                    onChange=(
                      isValidKey =>
                        CreateOrganizationForm.FormikProps.setFieldValue(
                          t,
                          ~key="isValidKey",
                          ~value=toAny(isValidKey)
                        )
                    )
                    value=values##key
                  />
                  (renderErrorHint(~errors, ~touched, ~key="key"))
                </div>
                <div>
                  {
                    let isValid = CreateOrganizationForm.FormikProps.isValid(t);
                    let isSubmitting =
                      CreateOrganizationForm.FormikProps.isSubmitting(t);
                    <button
                      _type="submit"
                      disabled=(
                        Js_boolean.to_js_boolean(! isValid || isSubmitting)
                      )>
                      (ReasonReact.stringToElement("Create organization"))
                    </button>;
                  }
                </div>
              </form>;
            }
          )
        />
      </div>
  };
};

let component = ReasonReact.statelessComponent("ConnectedSelectOrganization");

let make = _children => {
  ...component,
  render: _self =>
    <Route
      render=(
        renderProps => <OrganizationCreate history=renderProps##history />
      )
    />
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));