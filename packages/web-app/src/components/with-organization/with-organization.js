import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';

const OrganizationQuery = gql`
  query OrganizationQuery($key: String!) {
    organizationByKey(key: $key) {
      id
      key
      name
    }
  }
`;

export const organizationShape = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  organizationByKey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
});

const withOrganization = Component =>
  compose(
    withRouter,
    graphql(OrganizationQuery, {
      name: 'organization',
      options: ownProps => ({
        variables: {
          key: ownProps.match.params.organizationKey,
        },
      }),
    })
  )(Component);
export default withOrganization;
