import React from 'react';
import TopNavigation from '../top-navigation';

const ApplicationLandingPage = () => (
  <div>
    <TopNavigation isUserLoggedIn={false} />
    {'Landing page'}
  </div>
);

export default ApplicationLandingPage;
