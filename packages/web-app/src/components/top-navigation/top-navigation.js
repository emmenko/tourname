import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import withUser from '../with-user';

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
      {props.isUserLoading ? <PlaceholderText /> : props.fullName}
    </div>
    {props.isUserLoading ? (
      <PlaceholderImage />
    ) : (
      <UserAvatar key="picture" alt="User avatar" src={props.pictureUrl} />
    )}
    <Link to="/logout">{'Logout'}</Link>
  </UserMenu>
);
TopNavigationUserMenu.propTypes = {
  isUserLoading: PropTypes.bool.isRequired,
  fullName: PropTypes.string.isRequired,
  pictureUrl: PropTypes.string.isRequired,
};

const MenuForAuthenticatedUser = withUser(data => ({
  isUserLoading: data.loading,
  fullName: data.me.name,
  pictureUrl: data.me.picture,
}))(TopNavigationUserMenu);
const MenuForNotAuthenticatedUser = () => (
  <Link to="/login">
    <Button>{'Login'}</Button>
  </Link>
);

const TopNavigation = props => (
  <Container>
    <div>{'Logo'}</div>
    <div>
      {props.isUserAuthenticated ? (
        <MenuForAuthenticatedUser />
      ) : (
        <MenuForNotAuthenticatedUser />
      )}
    </div>
  </Container>
);
TopNavigation.propTypes = {
  isUserAuthenticated: PropTypes.bool.isRequired,
};

export default TopNavigation;
