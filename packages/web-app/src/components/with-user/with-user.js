import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const LoggedInUserQuery = gql`
  query LoggedInUser {
    me {
      id
      name
      picture
      availableOrganizations {
        id
        key
        name
      }
    }
  }
`;

export const userShape = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  me: PropTypes.shape({
    name: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
    availableOrganizations: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  }),
});

const withUser = mapDataToProps => Component =>
  compose(
    withRouter,
    graphql(LoggedInUserQuery, {
      name: 'loggedInUser',
      props: ({ loggedInUser }) =>
        mapDataToProps ? mapDataToProps(loggedInUser) : { loggedInUser },
    })
  )(Component);
export default withUser;
