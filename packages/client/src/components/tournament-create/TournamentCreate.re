open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let columns = css([display(flex), flexDirection(row)]);
  let column = css([display(flex), flexDirection(column), flex_(int(1))]);
  let formView = css([select("> * + *", [marginTop(px(16))])]);
};

module CreateTournamentForm =
  Formik.CreateForm({
    type valueTypes = {
      .
      "organizationKey": string,
      "name": string,
      "size": TournameTypes.tournamentSize,
      "discipline": TournameTypes.discipline,
      "teamSize": int,
    };
  });

module CreateTournamentMutation = [%graphql
  {|
  mutation CreateTournament(
    $organizationKey: String!,
    $name: String!,
    $size: TournamentSize!,
    $discipline: Discipline!
    $teamSize: Int!
  ) {
    createTournament(
      organizationKey: $organizationKey,
      name: $name,
      size: $size,
      discipline: $discipline,
      teamSize: $teamSize,
    ) {
      id
      organization { key }
    }
  }
|}
];

module CreateTournament =
  ReasonApollo.CreateMutation(CreateTournamentMutation);

let renderErrorHint =
    (~errors: Js.Dict.t(string), ~touched: Js.Dict.t(string), ~key: string) =>
  switch (Js.Dict.get(touched, key)) {
  | Some(_) =>
    switch (Js.Dict.get(errors, key)) {
    | Some(errorMessage) => <div> (errorMessage |> ReasonReact.string) </div>
    | None => ReasonReact.null
    }
  | None => ReasonReact.null
  };

module TournamentCreateFormView = {
  let component = ReasonReact.statelessComponent("TournamentCreate");
  let make = (~availableOrganizations, _children) => {
    ...component,
    render: _self =>
      <CreateTournament>
        ...(
             (mutation, mutationResult) => {
               let mutationResultComponent =
                 switch (mutationResult.result) {
                 | Loading
                 | NotCalled => ReasonReact.null
                 | Error(error) =>
                   let errorMsg =
                     switch (
                       Js.Exn.message(Client.apolloErrorToJsError(error))
                     ) {
                     | Some(message) => "Mutation error: " ++ message
                     | None => "An unknown error occurred"
                     };
                   errorMsg |> ReasonReact.string;
                 | Data(mutationResponse) =>
                   let organizationKey = mutationResponse##createTournament##organization##key;
                   let tournamentId = mutationResponse##createTournament##id;
                   <Redirect
                     to_={j|/$organizationKey/tournament/$tournamentId|j}
                   />;
                 };
               <CreateTournamentForm
                 initialValues=(
                   Formik.valuesToJsObject({
                     "organizationKey": availableOrganizations[0]##key,
                     "name": "",
                     "discipline": `TableTennis,
                     "size": `Small,
                     "teamSize": 1,
                   })
                 )
                 validate=(
                   values => {
                     let errors = Js.Dict.empty();
                     if (values##name == "") {
                       Js.Dict.set(errors, "name", "Required");
                     };
                     errors;
                   }
                 )
                 onSubmit=(
                   (values, formikActions) => {
                     let createTournamentMutation =
                       CreateTournamentMutation.make(
                         ~organizationKey=values##organizationKey,
                         ~name=values##name,
                         ~size=values##size,
                         ~discipline=values##discipline,
                         ~teamSize=values##teamSize,
                         (),
                       );
                     mutation(
                       ~variables=createTournamentMutation##variables,
                       (),
                     )
                     |> Js.Promise.then_(_rawResult => {
                          switch (mutationResult.result) {
                          | NotCalled
                          | Loading
                          | Data(_) => ()
                          /* Reset the form state only if the mutation did not succeeded */
                          | Error(_) =>
                            CreateTournamentForm.FormikActions.setSubmitting(
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
                     let values = CreateTournamentForm.FormikProps.values(t);
                     let touched =
                       CreateTournamentForm.FormikProps.touched(t);
                     let errors = CreateTournamentForm.FormikProps.errors(t);
                     <form
                       onSubmit=(
                         CreateTournamentForm.FormikProps.handleSubmit(t)
                       )>
                       <div>
                         <label>
                           ("Organization" |> ReasonReact.string)
                         </label>
                         <select
                           name="organizationKey"
                           onChange=(
                             CreateTournamentForm.FormikProps.handleChange(t)
                           )
                           onBlur=(
                             CreateTournamentForm.FormikProps.handleBlur(t)
                           )
                           defaultValue=values##organizationKey>
                           (
                             availableOrganizations
                             |> Array.mapi((index, org) =>
                                  <option
                                    key=(string_of_int(index)) value=org##key>
                                    (org##name |> ReasonReact.string)
                                  </option>
                                )
                             |> ReasonReact.array
                           )
                         </select>
                       </div>
                       <div>
                         <label> ("Name" |> ReasonReact.string) </label>
                         <input
                           type_="text"
                           name="name"
                           onChange=(
                             CreateTournamentForm.FormikProps.handleChange(t)
                           )
                           onBlur=(
                             CreateTournamentForm.FormikProps.handleBlur(t)
                           )
                           value=values##name
                         />
                         (renderErrorHint(~errors, ~touched, ~key="name"))
                       </div>
                       <div>
                         <label> ("Size" |> ReasonReact.string) </label>
                         <SelectTournamentSize
                           value=values##size
                           onChange=(
                             value => {
                               CreateTournamentForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="size",
                                 ~value=Formik.toAny(value),
                               );
                               CreateTournamentForm.FormikProps.setFieldTouched(
                                 t,
                                 ~key="size",
                                 ~value=true,
                               );
                             }
                           )
                         />
                       </div>
                       <div>
                         <label> ("Discipline" |> ReasonReact.string) </label>
                         <SelectDiscipline
                           value=values##discipline
                           onChange=(
                             value => {
                               CreateTournamentForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="discipline",
                                 ~value=Formik.toAny(value),
                               );
                               CreateTournamentForm.FormikProps.setFieldTouched(
                                 t,
                                 ~key="discipline",
                                 ~value=true,
                               );
                             }
                           )
                         />
                       </div>
                       <div>
                         <label>
                           (
                             "Number of players in each team"
                             |> ReasonReact.string
                           )
                         </label>
                         <SelectTeamSize
                           value=values##teamSize
                           onChange=(
                             value => {
                               CreateTournamentForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="teamSize",
                                 ~value=Formik.toAny(value),
                               );
                               CreateTournamentForm.FormikProps.setFieldTouched(
                                 t,
                                 ~key="teamSize",
                                 ~value=true,
                               );
                             }
                           )
                         />
                       </div>
                       mutationResultComponent
                       {
                         let isValid =
                           CreateTournamentForm.FormikProps.isValid(t);
                         let isSubmitting =
                           CreateTournamentForm.FormikProps.isSubmitting(t);
                         <button
                           type_="submit" disabled=(! isValid || isSubmitting)>
                           ("Create tournament" |> ReasonReact.string)
                         </button>;
                       }
                     </form>;
                   }
                 )
               />;
             }
           )
      </CreateTournament>,
  };
};

let component = ReasonReact.statelessComponent("TournamentCreate");

let make = (~onCancel, _children) => {
  ...component,
  render: _self =>
    <div className=(Styles.formView |> TypedGlamor.toString)>
      <h3> ("Create a new Tournament" |> ReasonReact.string) </h3>
      <button onClick=onCancel> ("Cancel" |> ReasonReact.string) </button>
      <FetchUser>
        ...(
             ({result}) =>
               switch (result) {
               | Loading => "Loading..." |> ReasonReact.string
               | Error(error) =>
                 Js.log(error);
                 ReasonReact.null;
               | Data(userResponse) =>
                 let availableOrganizations = userResponse##me##availableOrganizations;
                 <TournamentCreateFormView availableOrganizations />;
               }
           )
      </FetchUser>
    </div>,
};