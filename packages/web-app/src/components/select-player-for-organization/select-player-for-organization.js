import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Select from 'react-select';
import withOrganization from '../with-organization';

const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;
const SelectOption = styled.div``;

class SelectPlayerForOrganization extends React.Component {
  static displayName = 'SelectPlayerForOrganization';
  static propTypes = {
    ignoreValues: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func.isRequired,
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
    selectedOption: undefined,
  };
  render() {
    if (this.props.isLoadingOrganization) return null;

    const availableMembers = this.props.organizationMembers.filter(
      member => !this.props.ignoreValues.includes(member.id)
    );
    if (availableMembers.length === 0) {
      return 'No more members available';
    }

    return (
      <Select
        name="select-player-for-organization"
        value={this.state.selectedOption}
        onChange={selectedOption => {
          this.setState({ selectedOption });
          this.props.onChange(selectedOption.id);
        }}
        valueKey="id"
        options={availableMembers}
        optionRenderer={option => (
          <SelectOption key={option.id} value={option.id}>
            <UserAvatar key="picture" alt="User avatar" src={option.picture} />
            <div>{option.name}</div>
            <div>{option.email}</div>
          </SelectOption>
        )}
        valueRenderer={option => (
          <div>{`${option.name} (${option.email})`}</div>
        )}
        filterOption={(option, filterString) =>
          option.email.includes(filterString.toLowerCase()) ||
          option.name.toLowerCase().includes(filterString.toLowerCase())}
        clearable={false}
      />
    );
  }
}

export default withOrganization(data => ({
  isLoadingOrganization: data.loading,
  organizationMembers: data.loading ? [] : data.organization.members,
}))(SelectPlayerForOrganization);
