import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Select = styled.select``;
const SelectOption = styled.option``;

const DISCIPLINES = {
  TABLE_TENNIS: 'Table Tennis',
  POOL_TABLE: 'Pool Table',
};

class SelectDiscipline extends React.PureComponent {
  static displayName = 'SelectDiscipline';
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
        <SelectOption />
        {Object.keys(DISCIPLINES).map((key, index) => (
          <SelectOption key={index} value={key}>
            {DISCIPLINES[key]}
          </SelectOption>
        ))}
      </Select>
    );
  }
}

export default SelectDiscipline;
