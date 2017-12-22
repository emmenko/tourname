import React from 'react';
import ApplicationBar from '../application-bar';

const ApplicationLandingPage = () => (
  <div>
    <ApplicationBar isUserAuthenticated={false} />
    {'Landing page'}
  </div>
);

export default ApplicationLandingPage;
