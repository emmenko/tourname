import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import auth from '../../auth';
import withUser from '../with-user';
import ApplicationBarActionsMenu from '../application-bar-actions-menu';
import ApplicationBarUserMenu from '../application-bar-user-menu';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ccc;
  padding: 8px;
  height: 36px;
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
const MenusContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  > * + * {
    margin: 0 0 0 16px;
  }
`;
const LikeLink = styled.a``;

const MenuForAuthenticatedUser = withUser(data => ({
  isUserLoading: data.loading,
  fullName: data.me.name,
  email: data.me.email,
  pictureUrl: data.me.picture,
}))(ApplicationBarUserMenu);
const MenuForNotAuthenticatedUser = () => (
  <LikeLink onClick={() => auth.authorize()}>
    <Button>{'Login'}</Button>
  </LikeLink>
);

const ApplicationBar = props => (
  <Container>
    <div>
      <Link to="/">{'Logo'}</Link>
    </div>
    <MenusContainer>
      <ApplicationBarActionsMenu />
      {props.isUserAuthenticated ? (
        <MenuForAuthenticatedUser />
      ) : (
        <MenuForNotAuthenticatedUser />
      )}
    </MenusContainer>
  </Container>
);
ApplicationBar.propTypes = {
  isUserAuthenticated: PropTypes.bool.isRequired,
};

export default ApplicationBar;
