import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

class TournamentDetailAddPlayersForm extends React.PureComponent {
  static propTypes = {
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
  };
  renderTeamFormToAddPlayers = team => {
    const isTeamFull = team.length === this.props.teamSize;
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
  render() {
    const halfTheNumberOfTeams = this.props.teams.length / 2;
    const firstHalf = this.props.teams.slice(0, halfTheNumberOfTeams);
    const secondHalf = this.props.teams.slice(halfTheNumberOfTeams);
    const canStartTournament = this.props.teams.every(
      team => team.players.length === this.props.teamSize
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
            <Button disabled>
              {'Not enough players to start the tournament'}
            </Button>
          )}
        </div>
      </div>
    );
  }
}

export default TournamentDetailAddPlayersForm;
