import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import withAuth from '../with-auth';

class Logout extends React.PureComponent {
  static propTypes = {
    clearSession: PropTypes.func.isRequired,
    history: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
  };
  componentDidMount() {
    this.props.clearSession();
    this.props.history.replace('/');
  }
  render() {
    return null;
  }
}

export default compose(withRouter, withAuth)(Logout);
