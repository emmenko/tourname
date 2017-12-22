import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Slot = styled.div`
  display: inline-flex;
  align-items: center;
`;
const SlotItem = styled.div``;
const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;

class PlayerSlot extends React.Component {
  static displayName = 'PlayerSlot';
  static propTypes = {
    player: PropTypes.shape({
      id: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      picture: PropTypes.string.isRequired,
    }),
    onRemoveClick: PropTypes.func,
  };

  render() {
    return (
      <Slot>
        <SlotItem>
          <UserAvatar
            key="picture"
            alt="User avatar"
            src={this.props.player.picture}
          />
        </SlotItem>
        <SlotItem>
          <div>{this.props.player.name}</div>
          <div>{this.props.player.email}</div>
        </SlotItem>
        {this.props.onRemoveClick && (
          <SlotItem>
            <button onClick={this.props.onRemoveClick}>{'Remove'}</button>
          </SlotItem>
        )}
      </Slot>
    );
  }
}

export default PlayerSlot;
