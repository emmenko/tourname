import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerSearchDialog from '../player-search-dialog';

const Slot = styled.div`
  display: inline-flex;
`;
const AvatarPlaceholder = styled.div`
  height: 36px;
  width: 36px;
  border: 1px dashed #ccc;
  border-radius: 36px;
`;
const ButtonLink = styled.button``;

class PlayerSlotEmpty extends React.Component {
  static displayName = 'PlayerSlotEmpty';
  static propTypes = {
    registeredPlayers: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
  };
  state = {
    showPlayerSearchDialog: false,
  };
  render() {
    return (
      <Slot>
        <AvatarPlaceholder />
        <ButtonLink
          onClick={() => this.setState({ showPlayerSearchDialog: true })}
        >
          {'Add a player to this team'}
        </ButtonLink>
        {this.state.showPlayerSearchDialog && (
          <PlayerSearchDialog
            registeredPlayers={this.props.registeredPlayers}
            onSelect={this.props.onSelect}
            onClose={() => this.setState({ showPlayerSearchDialog: false })}
          />
        )}
      </Slot>
    );
  }
}

export default PlayerSlotEmpty;
