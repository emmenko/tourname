import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Breadcrumb from '../breadcrumb';
import Breadcrumbs from '../breadcrumbs';
import LoadingSpinner from '../loading-spinner';
import TournamentDetailAddPlayersForm from '../tournament-detail-add-players-form';

const flatMap = list => [].concat(...list);

const TournamentDetailQuery = gql`
  query TournamentDetail($id: String!) {
    tournament(id: $id) {
      id
      createdAt
      lastModifiedAt
      discipline
      name
      organizationKey
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

const AddPlayerToTeam = gql`
  mutation AddPlayerToTeam(
    $tournamentId: String!
    $teamKey: String!
    $playerId: String!
  ) {
    addPlayerToTeam(
      tournamentId: $tournamentId
      teamKey: $teamKey
      playerId: $playerId
    ) {
      id
      teams {
        key
        players {
          id
        }
      }
    }
  }
`;

const RemovePlayerFromTeam = gql`
  mutation RemovePlayerFromTeam(
    $tournamentId: String!
    $teamKey: String!
    $playerId: String!
  ) {
    removePlayerFromTeam(
      tournamentId: $tournamentId
      teamKey: $teamKey
      playerId: $playerId
    ) {
      id
      teams {
        key
        players {
          id
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
        organizationKey: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        teamSize: PropTypes.number.isRequired,
        teams: PropTypes.array.isRequired,
      }),
    }),
    addPlayerToTeam: PropTypes.func.isRequired,
    removePlayerFromTeam: PropTypes.func.isRequired,
  };
  render() {
    if (this.props.tournamentDetail.loading) return <LoadingSpinner />;

    const { tournament } = this.props.tournamentDetail;
    return (
      <div>
        <Breadcrumbs separator="//">
          <Breadcrumb linkTo={`/${this.props.match.params.organizationKey}`}>
            {this.props.match.params.organizationKey}
          </Breadcrumb>
          <Breadcrumb>{'Tournament'}</Breadcrumb>
        </Breadcrumbs>
        <p>{`Name: ${tournament.name}`}</p>
        <p>{`Status: ${tournament.status}`}</p>
        <p>{`Discipline: ${tournament.discipline}`}</p>
        <p>{`Max players for each team: ${tournament.teamSize}`}</p>

        {tournament.status === 'NEW' ? (
          <TournamentDetailAddPlayersForm
            tournamentId={tournament.id}
            teams={tournament.teams}
            teamSize={tournament.teamSize}
            registeredPlayers={flatMap(
              tournament.teams.map(team => team.players)
            ).map(player => player.id)}
            addPlayerToTeam={this.props.addPlayerToTeam}
            removePlayerFromTeam={this.props.removePlayerFromTeam}
          />
        ) : null}
      </div>
    );
  }
}

export default compose(
  graphql(TournamentDetailQuery, {
    alias: 'withTournament',
    name: 'tournamentDetail',
    options: ownProps => ({
      variables: {
        id: ownProps.match.params.tournamentId,
      },
    }),
  }),
  graphql(AddPlayerToTeam, { name: 'addPlayerToTeam' }),
  graphql(RemovePlayerFromTeam, { name: 'removePlayerFromTeam' })
)(TournamentDetail);
