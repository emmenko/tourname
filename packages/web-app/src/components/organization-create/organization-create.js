import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import { Formik } from 'formik';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import debounce from 'lodash.debounce';

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
const CheckOrganizationKey = gql`
  query CheckOrganizationKey($key: String!) {
    isOrganizationKeyUsed(key: $key)
  }
`;

class KeyCheckComponent extends React.Component {
  static displayName = 'KeyCheck';
  static propTypes = {
    client: PropTypes.shape({
      query: PropTypes.func.isRequired,
    }).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };
  state = {
    isFetching: false,
    isOrganizationKeyUsed: false,
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.executeQuery(nextProps.value);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.value !== nextProps.value ||
      this.state.isFetching !== nextState.isFetching
    );
  }
  executeQuery = debounce(
    value => {
      this.setState({ isFetching: true });
      this.props.client
        .query({
          query: CheckOrganizationKey,
          variables: {
            key: value,
          },
        })
        .then(result => {
          const { isOrganizationKeyUsed } = result.data;
          this.setState({
            isFetching: false,
            isOrganizationKeyUsed,
          });
          this.props.onChange(!isOrganizationKeyUsed);
        })
        .catch(error => {
          console.error('[KeyCheck] Error while fetching', error);
          this.setState({
            isFetching: false,
          });
        });
    },
    300, // Number of ms to delay
    { maxWait: 1000 }
  );
  render() {
    if (!this.props.value) return null;
    if (this.state.isFetching) return '...';
    return this.state.isOrganizationKeyUsed ? 'NO' : 'OK';
  }
}
const KeyCheckWithFetch = withApollo(KeyCheckComponent);

const OrganizationCreate = props => (
  <FormView>
    <FormTitle>{'Create a new organization'}</FormTitle>
    <Formik
      initialValues={{
        name: '',
        key: '',
        isValidKey: false,
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
        } else if (!values.isValidKey) {
          errors.key = 'Organization key already exists';
        }
        return errors;
      }}
      onSubmit={(values, actions) => {
        props
          .createOrganization({
            variables: {
              key: values.key,
              name: values.name,
            },
          })
          .then(
            () => {
              actions.setSubmitting(false);
              // TODO: Notify and redirect to dashboard page
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
          <KeyCheckWithFetch
            onChange={isValidKey => {
              setFieldValue('isValidKey', isValidKey);
            }}
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
  createOrganization: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  graphql(CreateOrganization, { name: 'createOrganization' })
)(OrganizationCreate);
