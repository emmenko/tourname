import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Dashboard from '../dashboard';
import TopNavigation from '../top-navigation';
import OrganizationCreate from '../organization-create';
import TournamentCreate from '../tournament-create';
import TournamentDetail from '../tournament-detail';
import TournamentsList from '../tournaments-list';

const LoggedInUserQuery = gql`
  query LoggedInUser($organizationKey: String) {
    me {
      name
      picture
      availableOrganizations {
        id
        key
        name
      }
      organization(key: $organizationKey) {
        id
        key
        name
      }
    }
  }
`;

const ApplicationRoutes = props => (
  <Switch>
    <Route
      exact={true}
      path="/:organizationKey"
      render={() => (
        <Dashboard
          userFullName={
            props.loggedInUser &&
            props.loggedInUser.me &&
            props.loggedInUser.me.name
          }
        />
      )}
    />
    <Route
      exact
      path="/:organizationKey/tournaments/new"
      render={TournamentCreate}
    />
    <Route path="/:organizationKey/tournaments/:id" render={TournamentDetail} />
    <Route path="/:organizationKey/tournaments" render={TournamentsList} />
  </Switch>
);
ApplicationRoutes.propTypes = {
  loggedInUser: PropTypes.shape({
    me: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }),
};

const ApplicationAuthenticated = props => {
  const user =
    props.loggedInUser && props.loggedInUser.me
      ? {
          name: props.loggedInUser.me.name,
          picture: props.loggedInUser.me.picture,
        }
      : null;
  const hasOrganization =
    props.loggedInUser &&
    props.loggedInUser.me &&
    props.loggedInUser.me.organization &&
    props.loggedInUser.me.availableOrganizations.length > 0;
  return (
    <div>
      <TopNavigation isUserLoggedIn={true} user={user} />
      <Switch>
        <Route path="/organizations/new" render={OrganizationCreate} />
        <Route
          render={routerProps =>
            !props.loggedInUser.loading && !hasOrganization ? (
              <Redirect to="/organizations/new" />
            ) : (
              <ApplicationRoutes {...routerProps} {...props} />
            )}
        />
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
      availableOrganizations: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ),
      organization: PropTypes.shape({
        id: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    }),
  }),
};

export default graphql(LoggedInUserQuery, {
  name: 'loggedInUser',
  options: ownProps => ({
    variables: {
      organizationKey:
        ownProps.match.params.organizationKey ||
        localStorage.getItem('organizationKey'),
    },
  }),
})(ApplicationAuthenticated);
