import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const MatchDetailQuery = gql`
  query MatchDetail($id: String!) {
    match(id: $id) {
      id
      createdAt
      lastModifiedAt
      discipline
      organizationKey
      tournamentId
      teamLeft {
        ...TeamInfo
      }
      teamRight {
        ...TeamInfo
      }
      winner {
        ...TeamInfo
      }
    }
  }
  fragment TeamInfo on Team {
    key
    players {
      id
      email
      name
      picture
    }
  }
`;

class MatchDetail extends React.PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        organizationKey: PropTypes.string.isRequired,
        matchId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    matchDetail: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      match: PropTypes.shape({
        id: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        lastModifiedAt: PropTypes.string.isRequired,
        discipline: PropTypes.string.isRequired,
        organizationKey: PropTypes.string.isRequired,
        teamLeft: PropTypes.array.isRequired,
        teamRight: PropTypes.array.isRequired,
        winner: PropTypes.array.isRequired,
        // If the `tournamentId` is not defined, it's considered as a quick match
        tournamentId: PropTypes.string,
      }),
    }),
  };
  render() {
    return (
      <span>{`Detail page of match ${this.props.match.params.matchId}`}</span>
    );
  }
}

export default graphql(MatchDetailQuery, {
  alias: 'withMatch',
  name: 'matchDetail',
  options: ownProps => ({
    variables: {
      id: ownProps.match.params.matchId,
    },
  }),
})(MatchDetail);
