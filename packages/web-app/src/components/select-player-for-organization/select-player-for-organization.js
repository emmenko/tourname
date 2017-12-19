import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import withOrganization from '../with-organization';

const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;
const Select = styled.select``;
const SelectOption = styled.option``;

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
  render() {
    if (this.props.isLoadingOrganization) return null;

    const availableMembers = this.props.organizationMembers.filter(
      member => !this.props.ignoreValues.includes(member.id)
    );
    // TODO: use react-select for "search" functionality
    return (
      <Select
        onChange={event => {
          this.props.onChange(event.target.value);
        }}
      >
        {availableMembers.length > 0 ? (
          <React.Fragment>
            <SelectOption />
            {availableMembers.map(member => (
              <SelectOption key={member.id} value={member.id}>
                <div>
                  <UserAvatar
                    key="picture"
                    alt="User avatar"
                    src={member.picture}
                  />
                  <div>{member.name}</div>
                  <div>{member.email}</div>
                </div>
              </SelectOption>
            ))}
          </React.Fragment>
        ) : (
          <SelectOption disabled={true}>
            {'No more members available'}
          </SelectOption>
        )}
      </Select>
    );
  }
}

export default withOrganization(data => ({
  isLoadingOrganization: data.loading,
  organizationMembers: data.loading ? [] : data.organization.members,
}))(SelectPlayerForOrganization);
