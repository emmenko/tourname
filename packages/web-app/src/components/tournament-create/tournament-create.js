import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { Formik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import withUser, { userShape } from '../with-user';

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

const CreateTournament = gql`
  mutation CreateTournament(
    $name: String!
    $size: String!
    $discipline: String!
    $organizationId: String!
    $teamSize: Int!
  ) {
    createTournament(
      name: $name
      size: $size
      discipline: $discipline
      organizationId: $organizationId
      teamSize: $teamSize
    ) {
      id
    }
  }
`;

const TournamentCreate = props => (
  <FormView>
    <FormTitle>{'Create a new tournament'}</FormTitle>
    <Formik
      initialValues={{
        name: '',
        size: 'SMALL',
        discipline: '',
        organizationId: props.loggedInUser.me.availableOrganizations[0].id,
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
        if (!values.organizationId) {
          errors.organizationId = 'Required';
        }
        if (!values.teamSize) {
          errors.key = 'Required';
        } else if (values.teamSize < 1) {
          errors.key = 'Team size must be at least 1';
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        props
          .createTournament({
            variables: {
              name: values.name,
              size: values.size,
              discipline: values.discipline,
              organizationId: values.organizationId,
              teamSize: values.teamSize,
            },
          })
          .then(
            () => {
              actions.setSubmitting(false);
              // TODO: Notify and redirect to tournament page
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
          <Select
            name="organizationId"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.organizationId}
          >
            {props.loggedInUser.me.availableOrganizations.map(org => (
              <SelectOption key={org.key} value={org.id}>
                {org.name}
              </SelectOption>
            ))}
          </Select>
          <Input
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
          />
          {touched.name &&
            errors.name && <InputError>{errors.name}</InputError>}
          <Select
            name="size"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.size}
          >
            <SelectOption value="SMALL">{'Small (4 players)'}</SelectOption>
            <SelectOption value="MEDIUM">{'Medium (8 players)'}</SelectOption>
            <SelectOption value="LARGE">{'Large (16 players)'}</SelectOption>
            <SelectOption value="XLARGE">{'XLarge (32 players)'}</SelectOption>
          </Select>
          <Select
            name="discipline"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.discipline}
          >
            <SelectOption>{'Select a discipline'}</SelectOption>
            <SelectOption value="TABLE_TENNIS">{'Table tennis'}</SelectOption>
            <SelectOption value="POOL_TABLE">{'Pool table'}</SelectOption>
          </Select>
          {touched.discipline &&
            errors.discipline && <InputError>{errors.discipline}</InputError>}
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
TournamentCreate.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  loggedInUser: userShape.isRequired,
  createTournament: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  withUser,
  graphql(CreateTournament, { name: 'createTournament' })
)(TournamentCreate);
