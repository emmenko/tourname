import React from 'react';
import PropTypes from 'prop-types';

class MatchDetail extends React.PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        organizationKey: PropTypes.string.isRequired,
        matchId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };
  render() {
    return (
      <span>{`Detail page of match ${this.props.match.params.matchId}`}</span>
    );
  }
}

export default MatchDetail;
