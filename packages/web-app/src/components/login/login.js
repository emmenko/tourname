import React from 'react';
import PropTypes from 'prop-types';
import withAuth from '../with-auth';

class Login extends React.PureComponent {
  static propTypes = {
    authorize: PropTypes.func.isRequired,
  };
  componentDidMount() {
    this.props.authorize();
  }
  render() {
    return null;
  }
}

export default withAuth(Login);
