import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Text = styled.h1`margin: 0;`;
const PlaceholderText = styled.h1`
  background-color: #eaeaea;
  height: 36px;
  margin: 0;
  width: 200px;
`;

const Welcome = props =>
  props.name ? <Text>{`Welcome ${props.name}`}</Text> : <PlaceholderText />;
Welcome.propTypes = {
  name: PropTypes.string,
};

export default Welcome;
