import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import withUser from '../with-user';

const View = styled.div`
  > * + * {
    margin: 16px 0 0 0;
  }
`;
const Title = styled.h2``;
const Select = styled.select``;
const SelectOption = styled.option``;

class SelectOrganization extends React.PureComponent {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    availableOrganizations: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  };
  componentWillReceiveProps(nextProps) {
    // Automatically redirect to the first organization page in case
    // there is only one.
    if (nextProps.availableOrganizations.length === 1)
      nextProps.history.push(`/${nextProps.availableOrganizations[0].key}`);
  }
  render() {
    return (
      <View>
        <Title>{'Select an organization from the list'}</Title>
        <Select
          onChange={event => {
            const { value } = event.target;
            this.props.history.push(`/${value}`);
          }}
        >
          {this.props.availableOrganizations.length > 0 ? (
            this.props.availableOrganizations.map(org => (
              <SelectOption key={org.key} value={org.key}>
                {org.name}
              </SelectOption>
            ))
          ) : (
            <SelectOption disabled={true}>{'Loading...'}</SelectOption>
          )}
        </Select>
      </View>
    );
  }
}

export default compose(
  withRouter,
  withUser(data => ({
    availableOrganizations: data.loading ? [] : data.me.availableOrganizations,
  }))
)(SelectOrganization);
