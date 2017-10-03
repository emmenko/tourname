import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import TopNavigation from '../top-navigation';

const LoggedInUserQuery = gql`
  query LoggedInUser {
    me {
      name
      picture
    }
  }
`;

const ApplicationAuthenticated = props => {
  const user =
    props.loggedInUser && props.loggedInUser.me
      ? {
          name: props.loggedInUser.me.name,
          picture: props.loggedInUser.me.picture,
        }
      : null;
  return (
    <div>
      <TopNavigation isUserLoggedIn={true} user={user} />
      {'Application authenticated'}
    </div>
  );
};
ApplicationAuthenticated.propTypes = {
  loggedInUser: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    me: PropTypes.shape({
      name: PropTypes.string.isRequired,
      picture: PropTypes.string.isRequired,
    }),
  }),
};

export default graphql(LoggedInUserQuery, {
  name: 'loggedInUser',
})(ApplicationAuthenticated);
