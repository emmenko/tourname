import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import withUser, { userShape } from '../with-user';
import Loading from '../loading';
import ApplicationContent from '../application-content';
import TopNavigation from '../top-navigation';
import OrganizationCreate from '../organization-create';
import SelectOrganization from '../select-organization';

const ApplicationAuthenticated = props => {
  if (props.loggedInUser.loading) return <Loading />;
  return (
    <div>
      <TopNavigation isUserAuthenticated={true} />
      <Route
        // Hidden route: check that the user has access to an organization
        // otherwise force him to create a new one.
        render={() => {
          const hasOrganization =
            props.loggedInUser.me.availableOrganizations.length > 0;
          if (!hasOrganization) return <Redirect to="/organizations/new" />;
          return null;
        }}
      />
      <Switch>
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
  loggedInUser: userShape.isRequired,
};

export default withUser(ApplicationAuthenticated);
