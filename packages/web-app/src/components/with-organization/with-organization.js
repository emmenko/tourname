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
      activeTournaments {
        ...TournamentInfo
      }
      finishedTournaments {
        ...TournamentInfo
      }
    }
  }

  fragment TournamentInfo on TournamentInfo {
    id
    discipline
    name
    status
    size
    teamSize
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

const withOrganization = mapDataToProps => Component =>
  compose(
    withRouter,
    graphql(OrganizationQuery, {
      name: 'organization',
      props: ({ organization }) =>
        mapDataToProps ? mapDataToProps(organization) : { organization },
      options: ownProps => ({
        variables: {
          key: ownProps.match.params.organizationKey,
        },
      }),
    })
  )(Component);
export default withOrganization;
