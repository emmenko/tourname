import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import styled from 'styled-components';
import { Breadcrumb, Breadcrumbs } from '../breadcrumbs';
import Loading from '../loading';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const UserAvatar = styled.img`
  height: 36px;
  border-radius: 18px;
`;
const Button = styled.button``;

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
  renderTeamFormToAddPlayers = team => {
    const { tournament } = this.props.tournamentDetail;
    const isTeamFull = team.length === tournament.teamSize;
    return (
      <div key={team.key}>
        <p>{`Team key: ${team.key}`}</p>
        {team.players.map(player => (
          <div key={player.id}>
            <UserAvatar key="picture" alt="User avatar" src={player.picture} />
            <div>{player.name}</div>
          </div>
        ))}
        {isTeamFull ? null : (
          // NOTE: list only members of this organization
          <Button>{'Add new player'}</Button>
        )}
      </div>
    );
  };
  renderFormToAddPlayers = () => {
    const { tournament } = this.props.tournamentDetail;
    const halfTheNumberOfTeams = tournament.teams.length / 2;
    const firstHalf = tournament.teams.slice(0, halfTheNumberOfTeams);
    const secondHalf = tournament.teams.slice(halfTheNumberOfTeams);
    const canStartTournament = tournament.teams.every(
      team => team.players.length === tournament.teamSize
    );
    return (
      <div>
        <Columns>
          <Column>{firstHalf.map(this.renderTeamFormToAddPlayers)}</Column>
          <Column>{secondHalf.map(this.renderTeamFormToAddPlayers)}</Column>
        </Columns>
        <div>
          {canStartTournament ? (
            <Button>{'Start tournament'}</Button>
          ) : (
            'Not enough players to start the tournament'
          )}
        </div>
      </div>
    );
  };
  render() {
    if (this.props.tournamentDetail.loading) return <Loading />;
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
        {tournament.status === 'NEW' ? this.renderFormToAddPlayers() : null}
      </div>
    );
  }
}

export default graphql(TournamentDetailQuery, {
  alias: 'withTournament',
  name: 'tournamentDetail',
  options: ownProps => ({
    variables: {
      id: ownProps.match.params.tournamentId,
    },
  }),
})(TournamentDetail);
