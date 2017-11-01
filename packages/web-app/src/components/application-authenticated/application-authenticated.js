import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import withUser from '../with-user';
import Loading from '../loading';
import ApplicationContent from '../application-content';
import TopNavigation from '../top-navigation';
import OrganizationCreate from '../organization-create';
import TournamentCreate from '../tournament-create';
import SelectOrganization from '../select-organization';

const ApplicationAuthenticated = props => {
  if (props.isApplicationLoading) return <Loading />;
  if (props.shouldForceToCreateAnOrganization)
    return <Redirect to="/organizations/new" />;
  return (
    <div>
      <TopNavigation isUserAuthenticated={true} />
      <Switch>
        <Route exact={true} path="/new" component={TournamentCreate} />
        <Route
          exact={true}
          path="/organizations/new"
          component={OrganizationCreate}
        />
        <Route
          exact={true}
          path="/"
          render={() => {
            const cachedOrganizationKey = localStorage.getItem(
              'organizationKey'
            );
            if (cachedOrganizationKey)
              return <Redirect to={`/${cachedOrganizationKey}`} />;
            return <SelectOrganization />;
          }}
        />
        <Route path="/:organizationKey" component={ApplicationContent} />
      </Switch>
    </div>
  );
};
ApplicationAuthenticated.propTypes = {
  isApplicationLoading: PropTypes.bool.isRequired,
  shouldForceToCreateAnOrganization: PropTypes.bool.isRequired,
};

export default withUser(data => ({
  isApplicationLoading: data.loading,
  shouldForceToCreateAnOrganization:
    !data.loading && data.me.availableOrganizations.length === 0,
}))(ApplicationAuthenticated);