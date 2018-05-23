import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { Formik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser from '../with-user';
import SelectTeamSize from '../select-team-size';
import SelectDiscipline from '../select-discipline';
import SelectTournamentSize from '../select-tournament-size';

const FormView = styled.div`
  > * + * {
    margin: 16px 0 0 0;
  }
`;
const FormTitle = styled.h3``;
const Form = styled.form``;
const FormField = styled.div``;
const Input = styled.input``;
const Select = styled.select``;
const SelectOption = styled.option``;
const InputError = styled.div``;
const SubmitButton = styled.button``;

const CreateTournament = gql`
  mutation CreateTournament(
    $name: String!
    $size: TournamentSize!
    $discipline: Discipline!
    $organizationKey: String!
    $teamSize: Int!
  ) {
    createTournament(
      name: $name
      size: $size
      discipline: $discipline
      organizationKey: $organizationKey
      teamSize: $teamSize
    ) {
      id
    }
  }
`;

class TournamentCreate extends React.PureComponent {
  static displayName = 'TournamentCreate';
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
    createTournament: PropTypes.func.isRequired,
  };
  render() {
    return (
      <FormView>
        <FormTitle>{'Create a new tournament'}</FormTitle>
        <Formik
          initialValues={{
            name: '',
            size: 'Small',
            discipline: '',
            organizationKey: this.props.defaultOrganizationKey,
            teamSize: 1,
          }}
          validate={values => {
            const errors = {};
            if (!values.name) {
              errors.name = 'Required';
            }
            if (!values.discipline) {
              errors.discipline = 'Required';
            }
            if (!values.organizationKey) {
              errors.organizationKey = 'Required';
            }
            return errors;
          }}
          onSubmit={(values, actions) => {
            const { organizationKey } = values;
            this.props
              .createTournament({
                variables: {
                  name: values.name,
                  size: values.size,
                  discipline: values.discipline,
                  organizationKey,
                  teamSize: values.teamSize,
                },
              })
              .then(
                result => {
                  actions.setSubmitting(false);
                  const tournamentId = result.data.createTournament.id;
                  // TODO: Notify
                  this.props.history.push(
                    `/${organizationKey}/tournaments/${tournamentId}`
                  );
                },
                (/* error */) => {
                  actions.setSubmitting(false);
                  // TODO: map graphql errors to formik
                  // actions.setErrors
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
          }) => (
            <Form onSubmit={handleSubmit}>
              <FormField>
                <label>{'Organization'}</label>
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
              </FormField>
              <FormField>
                <label>{'Tournament name'}</label>
                <Input
                  type="text"
                  name="name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
                {touched.name &&
                  errors.name && <InputError>{errors.name}</InputError>}
              </FormField>
              <FormField>
                <label>{'Tournament size'}</label>
                <SelectTournamentSize
                  value={values.size}
                  onChange={handleChange}
                />
              </FormField>
              <FormField>
                <label>{'Discipline'}</label>
                <SelectDiscipline
                  value={values.discipline}
                  onChange={handleChange}
                />
                {touched.discipline &&
                  errors.discipline && (
                    <InputError>{errors.discipline}</InputError>
                  )}
              </FormField>
              <FormField>
                <label>{'Number of players in each team'}</label>
                <SelectTeamSize
                  value={values.teamSize}
                  onChange={value => {
                    setFieldValue('teamSize', value);
                    setFieldTouched('teamSize', true);
                  }}
                />
              </FormField>
              <SubmitButton type="submit" disabled={!isValid || isSubmitting}>
                {'Create tournament'}
              </SubmitButton>
            </Form>
          )}
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
  graphql(CreateTournament, { name: 'createTournament' })
)(TournamentCreate);
