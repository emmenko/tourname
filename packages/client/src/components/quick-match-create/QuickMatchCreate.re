open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let columns = css([display(flex), flexDirection(row)]);
  let column = css([display(flex), flexDirection(column), flex_(int(1))]);
  let formView = css([select("> * + *", [marginTop(px(16))])]);
};

module CreateQuickMatchForm =
  Formik.CreateForm({
    type valueTypes = {
      .
      "organizationKey": string,
      "discipline": TournameTypes.discipline,
      "teamSize": int,
      "playerIdsTeamLeft": list(string),
      "playerIdsTeamRight": list(string),
    };
  });

module CreateQuickMatchMutation = [%graphql
  {|
  mutation CreateQuickMatch(
    $organizationKey: String!,
    $discipline: Discipline!
    $teamLeft: MatchSingleTeamInput!
    $teamRight: MatchSingleTeamInput!
  ) {
    createSingleMatch(
      organizationKey: $organizationKey,
      discipline: $discipline,
      teamLeft: $teamLeft,
      teamRight: $teamRight
    ) {
      id
      organization { key }
    }
  }
|}
];

module CreateQuickMatch =
  ReasonApollo.CreateMutation(CreateQuickMatchMutation);

module QuickMatchCreateFormView = {
  let component = ReasonReact.statelessComponent("QuickMatchCreate");
  let make = (~availableOrganizations, _children) => {
    ...component,
    render: _self =>
      <CreateQuickMatch>
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
                   let organizationKey = mutationResponse##createSingleMatch##organization##key;
                   let singleMatchId = mutationResponse##createSingleMatch##id;
                   <Redirect
                     to_={j|/$organizationKey/match/$singleMatchId|j}
                   />;
                 };
               <CreateQuickMatchForm
                 initialValues=(
                   Formik.valuesToJsObject({
                     "organizationKey": availableOrganizations[0]##key,
                     "discipline": `TableTennis,
                     "teamSize": 1,
                     "playerIdsTeamLeft": [],
                     "playerIdsTeamRight": [],
                   })
                 )
                 validate=(
                   values => {
                     let errors = Js.Dict.empty();
                     if (List.length(values##playerIdsTeamLeft)
                         != values##teamSize) {
                       Js.Dict.set(
                         errors,
                         "playerIdsTeamLeft",
                         "Each team must contain "
                         ++ string_of_int(values##teamSize)
                         ++ " players",
                       );
                     };
                     if (List.length(values##playerIdsTeamRight)
                         != values##teamSize) {
                       Js.Dict.set(
                         errors,
                         "playerIdsTeamRight",
                         "Each team must contain "
                         ++ string_of_int(values##teamSize)
                         ++ " players",
                       );
                     };
                     errors;
                   }
                 )
                 onSubmit=(
                   (values, formikActions) => {
                     let createSingleMatchMutation =
                       CreateQuickMatchMutation.make(
                         ~organizationKey=values##organizationKey,
                         ~discipline=values##discipline,
                         ~teamLeft={
                           "size": values##teamSize,
                           "playerIds":
                             values##playerIdsTeamLeft |> Array.of_list,
                         },
                         ~teamRight={
                           "size": values##teamSize,
                           "playerIds":
                             values##playerIdsTeamRight |> Array.of_list,
                         },
                         (),
                       );
                     mutation(
                       ~variables=createSingleMatchMutation##variables,
                       (),
                     )
                     |> Js.Promise.then_(_rawResult => {
                          switch (mutationResult.result) {
                          | NotCalled
                          | Loading
                          | Data(_) => ()
                          /* Reset the form state only if the mutation did not succeeded */
                          | Error(_) =>
                            CreateQuickMatchForm.FormikActions.setSubmitting(
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
                     let values = CreateQuickMatchForm.FormikProps.values(t);
                     let registeredPlayerIds =
                       List.append(
                         values##playerIdsTeamLeft,
                         values##playerIdsTeamRight,
                       );
                     <form
                       onSubmit=(
                         CreateQuickMatchForm.FormikProps.handleSubmit(t)
                       )>
                       <div>
                         <label>
                           ("Organization" |> ReasonReact.string)
                         </label>
                         <select
                           name="organizationKey"
                           onChange=(
                             CreateQuickMatchForm.FormikProps.handleChange(t)
                           )
                           onBlur=(
                             CreateQuickMatchForm.FormikProps.handleBlur(t)
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
                         <label> ("Discipline" |> ReasonReact.string) </label>
                         <SelectDiscipline
                           value=values##discipline
                           onChange=(
                             value => {
                               CreateQuickMatchForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="discipline",
                                 ~value=Formik.toAny(value),
                               );
                               CreateQuickMatchForm.FormikProps.setFieldTouched(
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
                               CreateQuickMatchForm.FormikProps.setFieldValue(
                                 t,
                                 ~key="teamSize",
                                 ~value=Formik.toAny(value),
                               );
                               CreateQuickMatchForm.FormikProps.setFieldTouched(
                                 t,
                                 ~key="teamSize",
                                 ~value=true,
                               );
                             }
                           )
                         />
                       </div>
                       <div className=(Styles.columns |> TypedGlamor.toString)>
                         <div
                           className=(Styles.column |> TypedGlamor.toString)>
                           <label>
                             ("Team left players" |> ReasonReact.string)
                           </label>
                           <PlayersTeamSelection
                             organizationKey=values##organizationKey
                             teamSize=values##teamSize
                             teamPlayerIds=values##playerIdsTeamLeft
                             registeredPlayerIds
                             setFieldValue=(
                               newTeam => {
                                 CreateQuickMatchForm.FormikProps.setFieldValue(
                                   t,
                                   ~key="playerIdsTeamLeft",
                                   ~value=Formik.toAny(newTeam),
                                 );
                                 CreateQuickMatchForm.FormikProps.setFieldTouched(
                                   t,
                                   ~key="playerIdsTeamLeft",
                                   ~value=true,
                                 );
                               }
                             )
                           />
                         </div>
                         <div
                           className=(Styles.column |> TypedGlamor.toString)>
                           <label>
                             ("Team right players" |> ReasonReact.string)
                           </label>
                           <PlayersTeamSelection
                             organizationKey=values##organizationKey
                             teamSize=values##teamSize
                             teamPlayerIds=values##playerIdsTeamRight
                             registeredPlayerIds
                             setFieldValue=(
                               newTeam => {
                                 CreateQuickMatchForm.FormikProps.setFieldValue(
                                   t,
                                   ~key="playerIdsTeamRight",
                                   ~value=Formik.toAny(newTeam),
                                 );
                                 CreateQuickMatchForm.FormikProps.setFieldTouched(
                                   t,
                                   ~key="playerIdsTeamRight",
                                   ~value=true,
                                 );
                               }
                             )
                           />
                         </div>
                       </div>
                       mutationResultComponent
                       {
                         let isValid =
                           CreateQuickMatchForm.FormikProps.isValid(t);
                         let isSubmitting =
                           CreateQuickMatchForm.FormikProps.isSubmitting(t);
                         <button
                           type_="submit" disabled=(! isValid || isSubmitting)>
                           ("Create quick match" |> ReasonReact.string)
                         </button>;
                       }
                     </form>;
                   }
                 )
               />;
             }
           )
      </CreateQuickMatch>,
  };
};

let component = ReasonReact.statelessComponent("QuickMatchCreate");

let make = _children => {
  ...component,
  render: _self =>
    <div className=(Styles.formView |> TypedGlamor.toString)>
      <h3> ("Create a Quick Match" |> ReasonReact.string) </h3>
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
                 <QuickMatchCreateFormView availableOrganizations />;
               }
           )
      </FetchUser>
    </div>,
};

let default = ReasonReact.wrapReasonForJs(~component, () => make([||]));