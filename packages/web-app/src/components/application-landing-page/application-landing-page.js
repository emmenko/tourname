import React from 'react';
import TopNavigation from '../top-navigation';

const ApplicationLandingPage = () => (
  <div>
    <TopNavigation isUserAuthenticated={false} />
    {'Landing page'}
  </div>
);

export default ApplicationLandingPage;
