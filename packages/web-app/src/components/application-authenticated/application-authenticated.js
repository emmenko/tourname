import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Dashboard from '../dashboard';
import TopNavigation from '../top-navigation';
import TournamentCreate from '../tournament-create';
import TournamentDetail from '../tournament-detail';
import TournamentsList from '../tournaments-list';

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
      <Switch>
        <Route
          exact={true}
          path="/"
          render={() => <Dashboard userFullName={user && user.name} />}
        />
        <Route exact path="/tournaments/new" render={TournamentCreate} />
        <Route path="/tournaments/:id" render={TournamentDetail} />
        <Route path="/tournaments" render={TournamentsList} />
      </Switch>
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
