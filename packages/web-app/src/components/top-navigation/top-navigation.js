import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
const Button = styled.button`
  border-radius: 3px;
  padding: 4px 16px;
  margin: 0;
  background: transparent;
  color: #0074D9;
  border: 2px solid #0074D9;
  cursor: pointer;

  :hover {
    background-color: #0074D9;
    color: white;
  }
`;

const TopNavigation = props => (
  <Container>
    <div>{'Logo'}</div>
    <div>
      {props.isUserLoggedIn ? (
        <UserMenu>
          {props.user ? (
            [
              <div key="name">{props.user.name}</div>,
              <UserAvatar
                key="picture"
                alt="User avatar"
                src={props.user.picture}
              />,
            ]
          ) : null}
          <Link to="/logout">{'Logout'}</Link>
        </UserMenu>
      ) : (
        <Link to="/login">
          <Button>{'Login'}</Button>
        </Link>
      )}
    </div>
  </Container>
);
TopNavigation.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
  }),
};

export default TopNavigation;
