import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import withOrganization from '../with-organization';
import Modal from '../modal';
import PlayerSlot from '../player-slot';

const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Dialog = styled.div`
  background-color: white;
  width: 400px;
  padding: 16px;
`;
const SelectableItem = styled.div`
  background-color: white;
  :hover {
    background-color: #eee;
  }
  ${props =>
    props.isActive &&
    css`
      background-color: #ccc;
    `};
`;

class PlayerSearchDialog extends React.Component {
  static displayName = 'PlayerSearchDialog';
  static propTypes = {
    registeredPlayers: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    // Injected
    isLoadingOrganization: PropTypes.bool.isRequired,
    organizationMembers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        picture: PropTypes.string.isRequired,
      })
    ),
  };
  state = {
    searchText: '',
    selectedPlayer: undefined,
  };
  handleSearchInputChange = event =>
    this.setState({ searchText: event.target.value });
  renderMemberList = () => {
    if (this.props.isLoadingOrganization) return 'Loading...';

    const availableMembers = this.props.organizationMembers.filter(
      member => !this.props.registeredPlayers.includes(member.id)
    );
    if (availableMembers.length === 0) {
      return 'No more members available';
    }

    return (
      <div style={{ border: '1px solid #ccc' }}>
        <input
          value={this.state.searchText}
          onChange={event => this.setState({ searchText: event.target.value })}
        />
        {availableMembers
          .filter(
            member =>
              !this.state.searchText ||
              member.name
                .toLowerCase()
                .includes(this.state.searchText.toLowerCase()) ||
              member.email
                .toLowerCase()
                .includes(this.state.searchText.toLowerCase())
          )
          .map(member => (
            <SelectableItem
              key={member.id}
              isActive={this.state.selectedPlayer === member}
              onClick={() => this.setState({ selectedPlayer: member })}
            >
              <PlayerSlot player={member} />
            </SelectableItem>
          ))}
      </div>
    );
  };
  render() {
    return (
      <Modal>
        <Overlay>
          <Dialog>
            <div>{'Search and select a player to add to the team'}</div>
            {this.renderMemberList()}
            <div>
              <button onClick={this.props.onClose}>{'Cancel'}</button>
              <button
                disabled={!this.state.selectedPlayer}
                onClick={() =>
                  this.props.onSelect(this.state.selectedPlayer.id)}
              >
                {'Select'}
              </button>
            </div>
          </Dialog>
        </Overlay>
      </Modal>
    );
  }
}

export default withOrganization(data => ({
  isLoadingOrganization: data.loading,
  organizationMembers: data.loading ? [] : data.organization.members,
}))(PlayerSearchDialog);
