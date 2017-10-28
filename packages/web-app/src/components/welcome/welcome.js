import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Text = styled.h1``;

const Welcome = props => <Text>{`Welcome ${props.name}`}</Text>;
Welcome.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Welcome;
