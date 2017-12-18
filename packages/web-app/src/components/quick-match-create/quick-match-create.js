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
            if (!values.teamSize) {
              errors.teamSize = 'Required';
            } else if (values.teamSize < 1) {
              errors.teamSize = 'Team size must be at least 1';
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
            console.log('submitting', values)
            this.props
              .createQuickMatch({
                variables: {
                  organizationKey,
                  discipline: values.discipline,
                  teamSize: values.teamSize,
                  teamLeft: values.teamLeft,
                  teamRight: values.teamRight,
                },
              })
              .then(
                result => {
                  console.log('ok', result)
                  actions.setSubmitting(false);
                  const matchId = result.data.createQuickMatch.id;
                  // TODO: Notify
                  this.props.history.push(
                    `/${organizationKey}/match/${matchId}`
                  );
                },
                error => {
                  console.log('ups', error)
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
              <label>{'Team left players'}</label>
              {/* TODO: use an autocomplete select to load list of players within the selected organization */}
              <Input
                type="text"
                name="teamLeft"
                onChange={event => {
                  const { value } = event.target;
                  setFieldValue('teamLeft', value.split(','));
                  setFieldTouched('teamLeft', true);
                }}
                onBlur={handleBlur}
                value={values.teamLeft.join(', ')}
              />
              {touched.teamLeft &&
                errors.teamLeft && <InputError>{errors.teamLeft}</InputError>}
              <label>{'Team right players'}</label>
              {/* TODO: use an autocomplete select to load list of players within the selected organization */}
              <Input
                type="text"
                name="teamRight"
                onChange={event => {
                  const { value } = event.target;
                  setFieldValue('teamRight', value.split(','));
                  setFieldTouched('teamRight', true);
                }}
                onBlur={handleBlur}
                value={values.teamRight.join(', ')}
              />
              {touched.teamRight &&
                errors.teamRight && <InputError>{errors.teamRight}</InputError>}
              <SubmitButton type="submit" disabled={!isValid || isSubmitting}>
                {'Create quick match'}
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
