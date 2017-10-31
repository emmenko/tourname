import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import withUser from '../with-user';

const OrganizationQuery = gql`
  query OrganizationQuery($memberId: String!, $key: String!) {
    organizationForUser(memberId: $memberId, key: $key) {
      id
      key
      name
    }
  }
`;

export const organizationShape = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  organizationForUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
});

const withOrganization = Component =>
  compose(
    withRouter,
    withUser,
    graphql(OrganizationQuery, {
      name: 'organization',
      options: ownProps => ({
        variables: {
          memberId: ownProps.loggedInUser.me.id,
          key: ownProps.match.params.organizationKey,
        },
      }),
    })
  )(Component);
export default withOrganization;
