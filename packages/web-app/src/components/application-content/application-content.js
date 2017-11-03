import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import withOrganization from '../with-organization';
import Loading from '../loading';
import Dashboard from '../dashboard';
import TournamentDetail from '../tournament-detail';
import TournamentsList from '../tournaments-list';

// TODO: when component is mounted, remove cached org key
const NotFound = () => <div>{'404 Not Found'}</div>;

const ApplicationContent = props => {
  if (props.isLoadingOrganization) return <Loading />;
  if (props.isOrganizationNotFound) return <NotFound />;
  return (
    <div>
      <Route
        // Hidden route: ensures that the `organizationKey` is saved in
        // local storage.
        path="/:organizationKey"
        render={({ match }) => {
          localStorage.setItem('organizationKey', match.params.organizationKey);
          return null;
        }}
      />
      <Switch>
        <Route exact={true} path="/:organizationKey" component={Dashboard} />
        <Route
          exact={true}
          path="/:organizationKey/tournaments/:tournamentId"
          component={TournamentDetail}
        />
        <Route
          exact={true}
          path="/:organizationKey/tournaments"
          component={TournamentsList}
        />
      </Switch>
    </div>
  );
};
ApplicationContent.propTypes = {
  isLoadingOrganization: PropTypes.bool.isRequired,
  isOrganizationNotFound: PropTypes.bool.isRequired,
};

export default withOrganization(data => ({
  isLoadingOrganization: data.loading,
  isOrganizationNotFound: !data.loading && !data.organization,
}))(ApplicationContent);
