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
const InputError = styled.div``;
const SubmitButton = styled.button``;

const CreateOrganization = gql`
  mutation CreateOrganization($key: String!, $name: String!, $userId: String!) {
    createOrganization(key: $key, name: $name, memberId: $userId) {
      id
    }
  }
`;

const OrganizationCreate = props => (
  <FormView>
    <FormTitle>{'Create a new organization'}</FormTitle>
    <Formik
      initialValues={{
        name: '',
        key: '',
      }}
      validate={values => {
        const errors = {};
        if (!values.name) {
          errors.name = 'Required';
        }
        if (!values.key) {
          errors.key = 'Required';
        } else if (/\s/g.test(values.key)) {
          errors.key = 'Key cannot have whitespaces';
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        props
          .createOrganization({
            variables: {
              key: values.key,
              name: values.name,
              userId: props.loggedInUser.me.id,
            },
          })
          .then(
            () => {
              actions.setSubmitting(false);
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
          <Input
            type="text"
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.name}
          />
          {touched.name &&
            errors.name && <InputError>{errors.name}</InputError>}
          <Input
            type="text"
            name="key"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.key}
          />
          {touched.key && errors.key && <InputError>{errors.key}</InputError>}
          <SubmitButton type="submit" disabled={!isValid || isSubmitting}>
            {'Create organization'}
          </SubmitButton>
        </Form>
      )}
    />
  </FormView>
);
OrganizationCreate.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  loggedInUser: userShape.isRequired,
  createOrganization: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  withUser,
  graphql(CreateOrganization, { name: 'createOrganization' })
)(OrganizationCreate);
