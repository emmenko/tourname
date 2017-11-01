import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import withUser, { userShape } from '../with-user';
import Loading from '../loading';

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
    loggedInUser: userShape.isRequired,
  };
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.loggedInUser.me &&
      nextProps.loggedInUser.me.availableOrganizations.length === 1
    )
      nextProps.history.push(
        `/${nextProps.loggedInUser.me.availableOrganizations[0].key}`
      );
  }
  render() {
    return (
      <View>
        <Title>{'Select an organization from the list'}</Title>
        {this.props.loggedInUser.loading ? (
          <Loading />
        ) : (
          <Select
            onChange={event => {
              const { value } = event.target;
              this.props.history.push(`/${value}`);
            }}
          >
            {this.props.loggedInUser.me.availableOrganizations.map(org => (
              <SelectOption key={org.key} value={org.key}>
                {org.name}
              </SelectOption>
            ))}
          </Select>
        )}
      </View>
    );
  }
}

export default compose(withRouter, withUser())(SelectOrganization);
