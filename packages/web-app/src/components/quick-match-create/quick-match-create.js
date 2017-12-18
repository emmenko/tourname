import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { Formik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser from '../with-user';

const FormView = styled.div`
  > * + * {
    margin: 16px 0 0 0;
  }
`;
const FormTitle = styled.h3``;
const Form = styled.form``;
const Input = styled.input``;
const Select = styled.select``;
const SelectOption = styled.option``;
const InputError = styled.div``;
const SubmitButton = styled.button``;

const CreateQuickMatch = gql`
  mutation CreateQuickMatch(
    $organizationKey: String!
    $discipline: Discipline!
    $teamSize: Int!
    $playersLeft: [String!]!
    $playersRight: [String!]!
  ) {
    createQuickMatch(
      organizationKey: $organizationKey
      discipline: $discipline
      teamSize: $teamSize
      teamLeft: $playersLeft
      teamRight: $playersRight
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
            name: '',
            size: 'SMALL',
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
            if (!values.teamSize) {
              errors.key = 'Required';
            } else if (values.teamSize < 1) {
              errors.key = 'Team size must be at least 1';
            }
            return errors;
          }}
          onSubmit={(values, actions) => {
            const { organizationKey } = values;
            this.props
              .createQuickMatch({
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
                  const tournamentId = result.data.createQuickMatch.id;
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
          }) => (
            <Form onSubmit={handleSubmit}>
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
              <label>{'Tournament size'}</label>
              <Select
                name="size"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.size}
              >
                <SelectOption value="SMALL">{'Small (4 players)'}</SelectOption>
                <SelectOption value="MEDIUM">
                  {'Medium (8 players)'}
                </SelectOption>
                <SelectOption value="LARGE">
                  {'Large (16 players)'}
                </SelectOption>
                <SelectOption value="XLARGE">
                  {'XLarge (32 players)'}
                </SelectOption>
              </Select>
              <label>{'Discipline'}</label>
              <Select
                name="discipline"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.discipline}
              >
                <SelectOption>{'Select a discipline'}</SelectOption>
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
              <Input
                type="number"
                name="teamSize"
                min={1}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.teamSize}
              />
              {touched.teamSize &&
                errors.teamSize && <InputError>{errors.teamSize}</InputError>}
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
  graphql(CreateQuickMatch, { name: 'createQuickMatch' })
)(QuickMatchCreate);