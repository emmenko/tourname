import React from 'react';
import { Route, Switch } from 'react-router-dom';
import withOrganization, { organizationShape } from '../with-organization';
import Loading from '../loading';
import Dashboard from '../dashboard';
import TournamentDetail from '../tournament-detail';
import TournamentsList from '../tournaments-list';

// TODO: when component is mounted, remove cached org key
const NotFound = () => <div>{'404 Not Found'}</div>;

const ApplicationContent = props => {
  if (props.organization.loading) return <Loading />;
  if (!props.organization.organizationByKey) return <NotFound />;
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
          path="/:organizationKey/tournaments/:id"
          render={TournamentDetail}
        />
        <Route
          exact={true}
          path="/:organizationKey/tournaments"
          render={TournamentsList}
        />
      </Switch>
    </div>
  );
};
ApplicationContent.propTypes = {
  organization: organizationShape.isRequired,
};

export default withOrganization()(ApplicationContent);
