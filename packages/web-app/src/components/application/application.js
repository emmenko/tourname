import React from 'react';
import PropTypes from 'prop-types';
import withAuth from '../with-auth';
import ApplicationAuthenticated from '../application-authenticated';
import ApplicationLandingPage from '../application-landing-page';

const Application = props =>
  props.isAuthenticated ? (
    <ApplicationAuthenticated />
  ) : (
    <ApplicationLandingPage />
  );
Application.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default withAuth(Application);
