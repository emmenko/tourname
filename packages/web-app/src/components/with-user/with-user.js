import { withRouter } from 'react-router';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const LoggedInUserQuery = gql`
  query LoggedInUser {
    me {
      id
      name
      email
      picture
      availableOrganizations {
        key
        name
      }
    }
  }
`;

const withUser = mapDataToProps => Component =>
  compose(
    withRouter,
    graphql(LoggedInUserQuery, {
      alias: 'withUser',
      name: 'loggedInUser',
      props: ({ loggedInUser }) =>
        mapDataToProps ? mapDataToProps(loggedInUser) : { loggedInUser },
    })
  )(Component);
export default withUser;
