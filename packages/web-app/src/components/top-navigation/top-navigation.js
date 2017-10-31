import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import withUser, { userShape } from '../with-user';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ccc;
  padding: 8px;
  height: 36px;
`;
const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;
const UserMenu = styled.div`
  display: inline-flex;
  align-items: center;

  > * + * {
    margin: 0 0 0 8px;
  }
`;
const PlaceholderText = styled.div`
  background-color: #eaeaea;
  height: 20px;
  width: 100px;
`;
const PlaceholderImage = styled.div`
  background-color: #eaeaea;
  border-radius: 36px;
  height: 36px;
  width: 36px;
`;
const Button = styled.button`
  border-radius: 3px;
  padding: 4px 16px;
  margin: 0;
  background: transparent;
  color: #0074d9;
  border: 2px solid #0074d9;
  cursor: pointer;

  :hover {
    background-color: #0074d9;
    color: white;
  }
`;

const TopNavigationUserMenu = props => (
  <UserMenu>
    <div key="name">
      {props.loggedInUser.me ? props.loggedInUser.me.name : <PlaceholderText />}
    </div>
    {props.loggedInUser.me ? (
      <UserAvatar
        key="picture"
        alt="User avatar"
        src={props.loggedInUser.me.picture}
      />
    ) : (
      <PlaceholderImage />
    )}
    <Link to="/logout">{'Logout'}</Link>
  </UserMenu>
);
TopNavigationUserMenu.propTypes = {
  loggedInUser: userShape.isRequired,
};

const WithAuthenticatedUser = withUser(TopNavigationUserMenu);
const WithoutAuthenticatedUser = () => (
  <Link to="/login">
    <Button>{'Login'}</Button>
  </Link>
);

const TopNavigation = props => (
  <Container>
    <div>{'Logo'}</div>
    <div>
      {props.isUserAuthenticated ? (
        <WithAuthenticatedUser />
      ) : (
        <WithoutAuthenticatedUser />
      )}
    </div>
  </Container>
);
TopNavigation.propTypes = {
  isUserAuthenticated: PropTypes.bool.isRequired,
};

export default TopNavigation;
