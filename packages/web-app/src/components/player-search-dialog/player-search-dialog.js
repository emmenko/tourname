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
const DialogHeader = styled.div`
  border-bottom: 1px solid #ccc;
`;
const DialogBody = styled.div`
  margin: 16px 0;
`;
const DialogFooter = styled.div`
  border-top: 1px solid #ccc;
`;
const SearchResults = styled.div`
  margin-top: 16px;
  width: 100%;
  > * + * {
    margin: 4px 0 0;
  }
`;
const SelectableItem = styled.div`
  border-left: 2px solid #ccc;
  background-color: white;
  :hover {
    background-color: #eee;
  }

  ${props =>
    props.isActive &&
    css`
      border-left: 2px solid #aaa;
      background-color: #ccc;
      :hover {
        background-color: #ccc;
      }
    `};
`;

class PlayerSearchDialog extends React.PureComponent {
  static displayName = 'PlayerSearchDialog';
  static propTypes = {
    registeredPlayers: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    // Accepts a prop to fall back to when fetching the organization by key
    fallbackOrganizationKey: PropTypes.string,
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
      <React.Fragment>
        <input
          value={this.state.searchText}
          onChange={event => this.setState({ searchText: event.target.value })}
        />
        <SearchResults>
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
        </SearchResults>
      </React.Fragment>
    );
  };
  render() {
    return (
      <Modal>
        <Overlay>
          <Dialog>
            <DialogHeader>
              {'Search and select a player to add to the team'}
            </DialogHeader>
            <DialogBody>{this.renderMemberList()}</DialogBody>
            <DialogFooter>
              <button onClick={this.props.onClose}>{'Cancel'}</button>
              <button
                disabled={!this.state.selectedPlayer}
                onClick={() => {
                  this.props.onSelect(this.state.selectedPlayer);
                  this.props.onClose();
                }}
              >
                {'Select'}
              </button>
            </DialogFooter>
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
