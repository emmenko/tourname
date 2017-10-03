import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const TopNavigation = props => (
  <div>
    {'Top Navigation'}
    {props.user ? (
      <div>
        <span>{props.user.name}</span>
        <img alt="User avatar" src={props.user.picture} />
      </div>
    ) : null}
    {props.isUserLoggedIn ? (
      <Link to="/logout">{'Logout'}</Link>
    ) : (
      <Link to="/login">{'Login'}</Link>
    )}
  </div>
);
TopNavigation.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
  }),
};

export default TopNavigation;
