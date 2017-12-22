import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { Formik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser from '../with-user';
import PlayerSlot from '../player-slot';
import PlayerSlotEmpty from '../player-slot-empty';
import SelectTeamSize from '../select-team-size';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const FormView = styled.div`
  > * + * {
    margin: 16px 0 0 0;
  }
`;
const FormTitle = styled.h3``;
const Form = styled.form``;
const Select = styled.select``;
const SelectOption = styled.option``;
const InputError = styled.div``;
const SubmitButton = styled.button``;

const CreateQuickMatch = gql`
  mutation CreateQuickMatch(
    $organizationKey: String!
    $discipline: Discipline!
    $teamSize: Int!
    $teamLeft: [String!]!
    $teamRight: [String!]!
  ) {
    createQuickMatch(
      organizationKey: $organizationKey
      discipline: $discipline
      teamSize: $teamSize
      teamLeft: $teamLeft
      teamRight: $teamRight
    ) {
      id
    }
  }
`;

class QuickMatchCreate extends React.PureComponent {
  static displayName = 'QuickMatchCreate';
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    defaultOrganizationKey: PropTypes.string.isRequired,
    availableOrganizations: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    createQuickMatch: PropTypes.func.isRequired,
  };

  render() {
    return (
      <FormView>
        <FormTitle>{'Create a Quick Match'}</FormTitle>
        <Formik
          initialValues={{
            organizationKey: this.props.defaultOrganizationKey,
            discipline: '',
            teamSize: 1,
            teamLeft: [],
            teamRight: [],
          }}
          validate={values => {
            const errors = {};
            if (!values.discipline) {
              errors.discipline = 'Required';
            }
            if (!values.organizationKey) {
              errors.organizationKey = 'Required';
            }
            if (values.teamLeft.length !== values.teamSize) {
              errors.teamLeft = `Each team must contain ${values.teamSize} players`;
            }
            if (values.teamRight.length !== values.teamSize) {
              errors.teamRight = `Each team must contain ${values.teamSize} players`;
            }
            return errors;
          }}
          onSubmit={(values, actions) => {
            const { organizationKey } = values;
            this.props
              .createQuickMatch({
                variables: {
                  organizationKey,
                  discipline: values.discipline,
                  teamSize: values.teamSize,
                  teamLeft: values.teamLeft.map(player => player.id),
                  teamRight: values.teamRight.map(player => player.id),
                },
              })
              .then(
                result => {
                  actions.setSubmitting(false);
                  const matchId = result.data.createQuickMatch.id;
                  // TODO: Notify
                  this.props.history.push(
                    `/${organizationKey}/match/${matchId}`
                  );
                },
                error => {
                  actions.setSubmitting(false);
                  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                    actions.setStatus({
                      errorMessage: error.graphQLErrors[0].message,
                    });
                  } else {
                    actions.setStatus({
                      errorMessage: error.message,
                    });
                  }
                }
              );
          }}
          render={({
            values,
            errors,
            touched,
            isValid,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            setFieldTouched,
            status,
          }) => {
            const registeredPlayers = values.teamLeft
              .concat(values.teamRight)
              .map(player => player.id);
            return (
              <Form onSubmit={handleSubmit}>
                <label>{'Organization'}</label>
                {status && status.errorMessage}
                <Select
                  name="organizationKey"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.organizationKey}
                >
                  {this.props.availableOrganizations.map(org => (
                    <SelectOption key={org.key} value={org.key}>
                      {org.name}
                    </SelectOption>
                  ))}
                </Select>
                <label>{'Discipline'}</label>
                <Select
                  name="discipline"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.discipline}
                >
                  <SelectOption />
                  <SelectOption value="TABLE_TENNIS">
                    {'Table tennis'}
                  </SelectOption>
                  <SelectOption value="POOL_TABLE">{'Pool table'}</SelectOption>
                </Select>
                {touched.discipline &&
                  errors.discipline && (
                    <InputError>{errors.discipline}</InputError>
                  )}
                <label>{'Number of players in each team'}</label>
                <SelectTeamSize
                  value={values.teamSize}
                  onChange={value => {
                    setFieldValue('teamSize', value);
                    setFieldTouched('teamSize', true);
                  }}
                />
                <Columns>
                  <Column>
                    <label>{'Team left players'}</label>
                    {Array.from(new Array(values.teamSize)).map((_, index) => {
                      const playerForIndex = values.teamLeft[index];
                      if (playerForIndex)
                        return (
                          <PlayerSlot
                            key={playerForIndex.id}
                            player={playerForIndex}
                            onRemoveClick={() => {
                              const teamWithoutPlayer = [
                                ...values.teamLeft.slice(0, index),
                                ...values.teamLeft.slice(index + 1),
                              ];
                              setFieldValue('teamLeft', teamWithoutPlayer);
                              setFieldTouched('teamLeft', true);
                            }}
                          />
                        );
                      return (
                        <PlayerSlotEmpty
                          key={index}
                          registeredPlayers={registeredPlayers}
                          onSelect={player => {
                            const teamWithPlayer = [
                              ...values.teamLeft.slice(0, index),
                              player,
                              ...values.teamLeft.slice(index + 1),
                            ];
                            setFieldValue('teamLeft', teamWithPlayer);
                            setFieldTouched('teamLeft', true);
                          }}
                          fallbackOrganizationKey={values.organizationKey}
                        />
                      );
                    })}
                  </Column>
                  <Column>
                    <label>{'Team right players'}</label>
                    {Array.from(new Array(values.teamSize)).map((_, index) => {
                      const playerForIndex = values.teamRight[index];
                      if (playerForIndex)
                        return (
                          <PlayerSlot
                            key={playerForIndex.id}
                            player={playerForIndex}
                            onRemoveClick={() => {
                              const teamWithoutPlayer = [
                                ...values.teamRight.slice(0, index),
                                ...values.teamRight.slice(index + 1),
                              ];
                              setFieldValue('teamRight', teamWithoutPlayer);
                              setFieldTouched('teamRight', true);
                            }}
                          />
                        );
                      return (
                        <PlayerSlotEmpty
                          key={index}
                          registeredPlayers={registeredPlayers}
                          onSelect={player => {
                            const teamWithPlayer = [
                              ...values.teamRight.slice(0, index),
                              player,
                              ...values.teamRight.slice(index + 1),
                            ];
                            setFieldValue('teamRight', teamWithPlayer);
                            setFieldTouched('teamRight', true);
                          }}
                          fallbackOrganizationKey={values.organizationKey}
                        />
                      );
                    })}
                  </Column>
                </Columns>

                <SubmitButton type="submit" disabled={!isValid || isSubmitting}>
                  {'Create quick match'}
                </SubmitButton>
              </Form>
            );
          }}
        />
      </FormView>
    );
  }
}

export default compose(
  withRouter,
  withUser(data => ({
    defaultOrganizationKey: data.me.availableOrganizations[0].key,
    availableOrganizations: data.me.availableOrganizations,
  })),
  graphql(CreateQuickMatch, { name: 'createQuickMatch' })
)(QuickMatchCreate);
