open ReasonReactRouterDom;

module Styles = {
  open TypedGlamor;
  let columns = css([display(flex), flexDirection(row)]);
  let column = css([display(flex), flexDirection(column), flex_(int(1))]);
  let formView = css([select("> * + *", [marginTop(px(16))])]);
};

module CreateQuickMatchForm =
  Formik.CreateForm(
    {
      type valueTypes = {
        .
        "organizationKey": string,
        "discipline": TournameTypes.discipline,
        "teamSize": int,
        "teamLeft": list(FetchOrganization.member),
        "teamRight": list(FetchOrganization.member),
      };
    },
  );

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

external apolloErrorToJsError : ReasonApolloTypes.apolloError => Js.Exn.t =
  "%identity";

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
                     switch (Js.Exn.message(apolloErrorToJsError(error))) {
                     | Some(message) => "Mutation error: " ++ message
                     | None => "An unknown error occurred"
                     };
                   errorMsg |> ReasonReact.string;
                 | Data(mutationResponse) =>
                   switch (mutationResponse##createSingleMatch) {
                   | Some(singleMatch) =>
                     let organizationKey = singleMatch##organization##key;
                     let singleMatchId = singleMatch##id;
                     <Redirect
                       to_={j|/$organizationKey/match/$singleMatchId|j}
                     />;
                   | None => ReasonReact.null
                   }
                 };
               <CreateQuickMatchForm
                 initialValues=(
                   Formik.valuesToJsObject({
                     "organizationKey": availableOrganizations[0]##key,
                     "discipline": `TableTennis,
                     "teamSize": 1,
                     "teamLeft": [],
                     "teamRight": [],
                   })
                 )
                 validate=(
                   values => {
                     let errors = Js.Dict.empty();
                     if (List.length(values##teamLeft) != values##teamSize) {
                       Js.Dict.set(
                         errors,
                         "teamLeft",
                         "Each team must contain "
                         ++ string_of_int(values##teamSize)
                         ++ " players",
                       );
                     };
                     if (List.length(values##teamRight) != values##teamSize) {
                       Js.Dict.set(
                         errors,
                         "teamRight",
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
                             values##teamLeft
                             |> List.map(player => player##id)
                             |> Array.of_list,
                         },
                         ~teamRight={
                           "size": values##teamSize,
                           "playerIds":
                             values##teamRight
                             |> List.map(player => player##id)
                             |> Array.of_list,
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
                     let registeredPlayers =
                       List.append(values##teamLeft, values##teamRight)
                       |> List.map(p => p##id);
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
                           value=(Some(values##discipline))
                           onChange=(
                             CreateQuickMatchForm.FormikProps.handleChange(t)
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
                             team=values##teamLeft
                             registeredPlayers
                             setFieldValue=(
                               newTeam => {
                                 CreateQuickMatchForm.FormikProps.setFieldValue(
                                   t,
                                   ~key="teamLeft",
                                   ~value=Formik.toAny(newTeam),
                                 );
                                 CreateQuickMatchForm.FormikProps.setFieldTouched(
                                   t,
                                   ~key="teamLeft",
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
                             team=values##teamRight
                             registeredPlayers
                             setFieldValue=(
                               newTeam => {
                                 CreateQuickMatchForm.FormikProps.setFieldValue(
                                   t,
                                   ~key="teamRight",
                                   ~value=Formik.toAny(newTeam),
                                 );
                                 CreateQuickMatchForm.FormikProps.setFieldTouched(
                                   t,
                                   ~key="teamRight",
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
                           _type="submit" disabled=(! isValid || isSubmitting)>
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