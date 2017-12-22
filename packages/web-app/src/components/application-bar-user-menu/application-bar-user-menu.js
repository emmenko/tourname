import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import styled from 'styled-components';
import auth from '../../auth';

const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;
const PlaceholderImage = styled.div`
  background-color: #eaeaea;
  border-radius: 36px;
  height: 36px;
  width: 36px;
`;
const MenuContainer = styled.div`
  position: relative;
`;
const Menu = styled.div`
  border: 1px solid rgba(34, 36, 38, 0.15);
  max-height: 150px;
  width: 200px;
  overflow-y: scroll;
  position: absolute;
  right: 0px;
  top: 3px;

  > * + * {
    margin: 8px 0 0;
  }
`;
const MenuHeadline = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 8px;
`;
const UserName = styled.div``;
const UserEmail = styled.div`
  color: #aaa;
  font-size: 0.7rem;
  word-break: break-all;
`;
const LikeLink = styled.a`
  display: block;
  padding: 4px 8px;
  :hover {
    background-color: #ccc;
  }
`;

const ApplicationBarUserMenu = props => {
  if (props.isUserLoading) {
    return <PlaceholderImage />;
  }
  return (
    <Downshift
      render={({ isOpen, toggleMenu }) => (
        <div>
          <div onClick={toggleMenu}>
            <UserAvatar
              key="picture"
              alt="User avatar"
              src={props.pictureUrl}
            />
          </div>
          {isOpen && (
            <MenuContainer>
              <Menu>
                <MenuHeadline>
                  <UserName>{props.fullName}</UserName>
                  <UserEmail>{props.email}</UserEmail>
                </MenuHeadline>
                <LikeLink onClick={() => auth.logout()}>{'Logout'}</LikeLink>
              </Menu>
            </MenuContainer>
          )}
        </div>
      )}
    />
  );
};

ApplicationBarUserMenu.propTypes = {
  isUserLoading: PropTypes.bool.isRequired,
  fullName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  pictureUrl: PropTypes.string.isRequired,
};

export default ApplicationBarUserMenu;
