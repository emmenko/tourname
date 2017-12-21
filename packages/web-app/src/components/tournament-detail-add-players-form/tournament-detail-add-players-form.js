import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerSlot from '../player-slot';
import PlayerSlotEmpty from '../player-slot-empty';

const Columns = styled.div`
  display: flex;
  flex-direction: row;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const Button = styled.button``;

class TeamForm extends React.Component {
  static displayName = 'TeamForm';
  static propTypes = {
    team: PropTypes.shape({
      key: PropTypes.string.isRequired,
      players: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          email: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          picture: PropTypes.string.isRequired,
        })
      ),
    }),
    teamSize: PropTypes.number.isRequired,
    tournamentId: PropTypes.string.isRequired,
    registeredPlayers: PropTypes.arrayOf(PropTypes.string).isRequired,
    addPlayerToTeam: PropTypes.func.isRequired,
    removePlayerFromTeam: PropTypes.func.isRequired,
  };
  render() {
    return (
      <div key={this.props.team.key}>
        <p>{`Team key: ${this.props.team.key}`}</p>

        {Array.from(new Array(this.props.teamSize)).map((_, index) => {
          const playerForIndex = this.props.team.players[index];
          if (playerForIndex)
            return (
              <PlayerSlot
                key={playerForIndex.id}
                player={playerForIndex}
                onRemoveClick={() => {
                  this.props.removePlayerFromTeam({
                    variables: {
                      tournamentId: this.props.tournamentId,
                      teamKey: this.props.team.key,
                      playerId: playerForIndex.id,
                    },
                  });
                }}
              />
            );
          return (
            <PlayerSlotEmpty
              key={index}
              registeredPlayers={this.props.registeredPlayers}
              onSelect={playerId => {
                this.props.addPlayerToTeam({
                  variables: {
                    tournamentId: this.props.tournamentId,
                    teamKey: this.props.team.key,
                    playerId,
                  },
                });
              }}
            />
          );
        })}
      </div>
    );
  }
}

class TournamentDetailAddPlayersForm extends React.Component {
  static propTypes = {
    tournamentId: PropTypes.string.isRequired,
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
    registeredPlayers: PropTypes.arrayOf(PropTypes.string).isRequired,
    addPlayerToTeam: PropTypes.func.isRequired,
    removePlayerFromTeam: PropTypes.func.isRequired,
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
          <Column>
            {firstHalf.map(team => (
              <TeamForm
                key={team.key}
                team={team}
                teamSize={this.props.teamSize}
                tournamentId={this.props.tournamentId}
                registeredPlayers={this.props.registeredPlayers}
                addPlayerToTeam={this.props.addPlayerToTeam}
                removePlayerFromTeam={this.props.removePlayerFromTeam}
              />
            ))}
          </Column>
          <Column>
            {secondHalf.map(team => (
              <TeamForm
                key={team.key}
                team={team}
                teamSize={this.props.teamSize}
                tournamentId={this.props.tournamentId}
                registeredPlayers={this.props.registeredPlayers}
                addPlayerToTeam={this.props.addPlayerToTeam}
                removePlayerFromTeam={this.props.removePlayerFromTeam}
              />
            ))}
          </Column>
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
