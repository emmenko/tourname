import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Select = styled.select``;
const SelectOption = styled.option``;

const MAX_TEAM_SIZE = 20;

class SelectTeamSize extends React.PureComponent {
  static displayName = 'SelectTeamSize';
  static propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };
  handleChange = event => {
    this.props.onChange(parseInt(event.target.value, 10));
  };
  render() {
    return (
      <Select
        name="teamSize"
        value={this.props.value}
        onChange={this.handleChange}
      >
        {Array.from(new Array(MAX_TEAM_SIZE)).map((_, index) => {
          const size = index + 1;
          return (
            <SelectOption key={index} value={size}>
              {size}
            </SelectOption>
          );
        })}
      </Select>
    );
  }
}

export default SelectTeamSize;
