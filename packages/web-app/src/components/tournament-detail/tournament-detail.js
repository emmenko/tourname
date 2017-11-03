import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link } from 'react-router-dom';
// import styled from 'styled-components';
import Loading from '../loading';

const TournamentDetailQuery = gql`
  query TournamentDetail($id: String!) {
    tournament(id: $id) {
      id
      createdAt
      lastModifiedAt
      discipline
      name
      organizationId
      status
      teamSize
      teams {
        key
        players {
          id
          email
          name
          picture
        }
      }
    }
  }
`;

class TournamentDetail extends React.PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        organizationKey: PropTypes.string.isRequired,
        tournamentId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    tournamentDetail: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      tournament: PropTypes.shape({
        id: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        lastModifiedAt: PropTypes.string.isRequired,
        discipline: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        organizationId: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        teamSize: PropTypes.number.isRequired,
        teams: PropTypes.arrayOf(
          PropTypes.shape({
            key: PropTypes.string.isRequired,
            players: PropTypes.arrayOf(
              PropTypes.shape({
                id: PropTypes.string.isRequired,
                email: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                picture: PropTypes.string.isRequired,
              })
            ),
          })
        ),
      }),
    }),
  };
  render() {
    if (this.props.tournamentDetail.loading) return <Loading />;
    const { tournament } = this.props.tournamentDetail;
    return (
      <div>
        <Link to={`/${this.props.match.params.organizationKey}`}>
          {'Back to tournament list'}
        </Link>
        <p>{`Name: ${tournament.name}`}</p>
        <p>{`Status: ${tournament.status}`}</p>
        <p>{`Discipline: ${tournament.discipline}`}</p>
      </div>
    );
  }
}

export default graphql(TournamentDetailQuery, {
  name: 'tournamentDetail',
  options: ownProps => ({
    variables: {
      id: ownProps.match.params.tournamentId,
    },
  }),
})(TournamentDetail);
