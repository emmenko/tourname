import React from 'react';
import { Link } from 'react-router-dom';
import Downshift from 'downshift';
import styled from 'styled-components';

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

const ApplicationBarActionsMenu = () => (
  <Downshift
    render={({ isOpen, closeMenu, toggleMenu }) => (
      <div>
        <div onClick={toggleMenu}>{'New'}</div>
        {isOpen && (
          <MenuContainer>
            <Menu>
              <div>
                <span onClick={closeMenu}>
                  <Link to="/new">{'New match / tournament'}</Link>
                </span>
              </div>
              <div>
                <span onClick={closeMenu}>
                  <Link to="/organizations/new">{'New organization'}</Link>
                </span>
              </div>
            </Menu>
          </MenuContainer>
        )}
      </div>
    )}
  />
);

export default ApplicationBarActionsMenu;
