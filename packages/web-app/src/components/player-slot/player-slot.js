import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
      <div>
        <UserAvatar
          key="picture"
          alt="User avatar"
          src={this.props.player.picture}
        />
        <div>
          <div>{this.props.player.name}</div>
          <div>{this.props.player.email}</div>
        </div>
        {this.props.onRemoveClick && (
          <button onClick={this.props.onRemoveClick}>{'Remove'}</button>
        )}
      </div>
    );
  }
}

export default PlayerSlot;
