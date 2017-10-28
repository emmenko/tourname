import React from 'react';
import PropTypes from 'prop-types';

const TournamentDetail = props => (
  <div>{`Detail of tournament: ${props.match.params.id}`}</div>
);
TournamentDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default TournamentDetail;
