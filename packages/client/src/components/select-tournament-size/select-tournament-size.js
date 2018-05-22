import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Select = styled.select``;
const SelectOption = styled.option``;

const SIZES = {
  SMALL: 'Small (4 players)',
  MEDIUM: 'Medium (8 players)',
  LARGE: 'Large (16 players)',
};

class SelectTournamentSize extends React.PureComponent {
  static displayName = 'SelectTournamentSize';
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };
  render() {
    return (
      <Select
        name="discipline"
        value={this.props.value}
        onChange={this.props.onChange}
      >
        {Object.keys(SIZES).map((key, index) => (
          <SelectOption key={index} value={key}>
            {SIZES[key]}
          </SelectOption>
        ))}
      </Select>
    );
  }
}

export default SelectTournamentSize;
