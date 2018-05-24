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
        "teamLeft": array(FetchOrganization.member),
        "teamRight": array(FetchOrganization.member),
      };
    },
  );

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
                                  Js.Exn.message(apolloErrorToJsError(error))
                                ) {
                                | Some(message) =>
                                  "Mutation error: " ++ message
                                | None => "An unknown error occurred"
                                };
                              errorMsg |> ReasonReact.string;
                            | Data(mutationResponse) =>
                              switch (mutationResponse##createSingleMatch) {
                              | Some(singleMatch) =>
                                let organizationKey = singleMatch##organization##key;
                                let singleMatchId = singleMatch##id;
                                Js.log2("Quick match created", singleMatchId);
                                <Redirect
                                  to_={j|/$organizationKey/match/$singleMatchId|j}
                                />;
                              | None => ReasonReact.null
                              }
                            };
                          <CreateQuickMatchForm
                            initialValues={
                                            let availableOrganizations = userResponse##me##availableOrganizations;
                                            Formik.valuesToJsObject({
                                              "organizationKey": availableOrganizations[0]##key,
                                              "discipline": `TableTennis,
                                              "teamSize": 1,
                                              "teamLeft": [||],
                                              "teamRight": [||],
                                            });
                                          }
                            validate=(
                              values => {
                                let errors = Js.Dict.empty();
                                if (Array.length(values##teamLeft)
                                    != values##teamSize) {
                                  Js.Dict.set(
                                    errors,
                                    "teamLeft",
                                    "Each team must contain "
                                    ++ string_of_int(values##teamSize)
                                    ++ " players",
                                  );
                                };
                                if (Array.length(values##teamRight)
                                    != values##teamSize) {
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
                                        |> Array.map(player => player##id),
                                    },
                                    ~teamRight={
                                      "size": values##teamSize,
                                      "playerIds":
                                        values##teamRight
                                        |> Array.map(player => player##id),
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
                                let values =
                                  CreateQuickMatchForm.FormikProps.values(t);
                                let touched =
                                  CreateQuickMatchForm.FormikProps.touched(t);
                                let errors =
                                  CreateQuickMatchForm.FormikProps.errors(t);
                                let registeredPlayers =
                                  Array.append(
                                    values##teamLeft,
                                    values##teamRight,
                                  )
                                  |> Array.map(p => p##id);
                                <form
                                  onSubmit=(
                                    CreateQuickMatchForm.FormikProps.handleSubmit(
                                      t,
                                    )
                                  )>
                                  <div>
                                    <label>
                                      ("Organization" |> ReasonReact.string)
                                    </label>
                                    <select
                                      name="organizationKey"
                                      onChange=(
                                        CreateQuickMatchForm.FormikProps.handleChange(
                                          t,
                                        )
                                      )
                                      onBlur=(
                                        CreateQuickMatchForm.FormikProps.handleBlur(
                                          t,
                                        )
                                      )
                                      defaultValue=values##organizationKey>
                                      (
                                        userResponse##me##availableOrganizations
                                        |> Array.mapi((index, org) =>
                                             <option
                                               key=(string_of_int(index))
                                               value=org##key>
                                               (
                                                 org##name |> ReasonReact.string
                                               )
                                             </option>
                                           )
                                        |> ReasonReact.array
                                      )
                                    </select>
                                  </div>
                                  <div>
                                    <label>
                                      ("Discipline" |> ReasonReact.string)
                                    </label>
                                    <SelectDiscipline
                                      value=(Some(values##discipline))
                                      onChange=(
                                        CreateQuickMatchForm.FormikProps.handleChange(
                                          t,
                                        )
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
                                  <div
                                    className=(
                                      Styles.columns |> TypedGlamor.toString
                                    )>
                                    <div
                                      className=(
                                        Styles.column |> TypedGlamor.toString
                                      )>
                                      <label>
                                        (
                                          "Team left players"
                                          |> ReasonReact.string
                                        )
                                        (
                                          Array.make(values##teamSize, true)
                                          |> Array.mapi((index, _empty) => {
                                               let team = values##teamLeft;
                                               switch (team[index]) {
                                               | playerForIndex =>
                                                 <PlayerSlot
                                                   key=(string_of_int(index))
                                                   player=playerForIndex
                                                   onRemoveClick=(
                                                     _event => {
                                                       let teamWithoutPlayer =
                                                         values##teamLeft
                                                         |> Array.to_list
                                                         |> List.filter(player =>
                                                              player
                                                              != playerForIndex
                                                            )
                                                         |> Array.of_list;
                                                       CreateQuickMatchForm.FormikProps.setFieldValue(
                                                         t,
                                                         ~key="teamLeft",
                                                         ~value=
                                                           Formik.toAny(
                                                             teamWithoutPlayer,
                                                           ),
                                                       );
                                                       CreateQuickMatchForm.FormikProps.setFieldTouched(
                                                         t,
                                                         ~key="teamLeft",
                                                         ~value=true,
                                                       );
                                                     }
                                                   )
                                                 />
                                               | exception (
                                                             Invalid_argument(
                                                               _e
                                                             )
                                                           ) =>
                                                 <PlayerSlotEmpty
                                                   key=(string_of_int(index))
                                                   registeredPlayers=(
                                                     Array.to_list(
                                                       registeredPlayers,
                                                     )
                                                   )
                                                   onSelect=(
                                                     player => {
                                                       let teamWithPlayer =
                                                         values##teamLeft
                                                         |> Array.copy;
                                                       teamWithPlayer[index] = player;
                                                       CreateQuickMatchForm.FormikProps.setFieldValue(
                                                         t,
                                                         ~key="teamLeft",
                                                         ~value=
                                                           Formik.toAny(
                                                             teamWithPlayer,
                                                           ),
                                                       );
                                                       CreateQuickMatchForm.FormikProps.setFieldTouched(
                                                         t,
                                                         ~key="teamLeft",
                                                         ~value=true,
                                                       );
                                                     }
                                                   )
                                                   fallbackOrganizationKey=values##organizationKey
                                                 />
                                               };
                                             })
                                          |> ReasonReact.array
                                        )
                                      </label>
                                    </div>
                                    <div
                                      className=(
                                        Styles.column |> TypedGlamor.toString
                                      )>
                                      <label>
                                        (
                                          "Team right players"
                                          |> ReasonReact.string
                                        )
                                      </label>
                                    </div>
                                  </div>
                                  mutationResultComponent
                                </form>;
                              }
                            )
                          />;
                        }
                      )
                 </CreateQuickMatch>
               }
           )
      </FetchUser>
    </div>,
};

let default = ReasonReact.wrapReasonForJs(~component, () => make([||]));