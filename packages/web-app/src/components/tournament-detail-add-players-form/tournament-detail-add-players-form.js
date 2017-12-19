import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Formik } from 'formik';
import SelectPlayerForOrganization from '../select-player-for-organization';

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
const Form = styled.form``;
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
    isTeamFull: PropTypes.bool.isRequired,
    tournamentId: PropTypes.string.isRequired,
    registeredPlayers: PropTypes.arrayOf(PropTypes.string).isRequired,
    addPlayerToTeam: PropTypes.func.isRequired,
    removePlayerFromTeam: PropTypes.func.isRequired,
  };
  state = {
    showAddPlayerForm: false,
  };
  render() {
    return (
      <div key={this.props.team.key}>
        <p>{`Team key: ${this.props.team.key}`}</p>
        {this.props.team.players.map(player => (
          <div key={player.id}>
            <UserAvatar key="picture" alt="User avatar" src={player.picture} />
            <div>{player.name}</div>
            <div>{player.email}</div>
            <Button
              onClick={() => {
                this.props.removePlayerFromTeam({
                  variables: {
                    tournamentId: this.props.tournamentId,
                    teamKey: this.props.team.key,
                    playerId: player.id,
                  },
                });
              }}
            >
              {'Remove from team'}
            </Button>
          </div>
        ))}
        {this.props.isTeamFull ? null : (
          <Button onClick={() => this.setState({ showAddPlayerForm: true })}>
            {'Add'}
          </Button>
        )}
        {this.state.showAddPlayerForm && (
          <Formik
            initialValues={{ playerId: null }}
            onSubmit={(values, actions) => {
              this.props
                .addPlayerToTeam({
                  variables: {
                    tournamentId: this.props.tournamentId,
                    teamKey: this.props.team.key,
                    playerId: values.playerId,
                  },
                })
                .then(
                  () => {
                    actions.setSubmitting(false);
                    this.setState({ showAddPlayerForm: false });
                  },
                  (/* error */) => {
                    actions.setSubmitting(false);
                    this.setState({ showAddPlayerForm: false });
                    // TODO: map graphql errors to formik
                    // actions.setErrors
                  }
                );
            }}
            render={formikProps => (
              <Form onSubmit={formikProps.handleSubmit}>
                <SelectPlayerForOrganization
                  ignoreValues={this.props.registeredPlayers}
                  onChange={value => {
                    formikProps.setFieldValue('playerId', value);
                    formikProps.setFieldTouched('playerId', true);
                  }}
                />
                <Button
                  type="submit"
                  disabled={!formikProps.isValid || formikProps.isSubmitting}
                >
                  {'Add new player'}
                </Button>
              </Form>
            )}
          />
        )}
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
                isTeamFull={team.players.length === this.props.teamSize}
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
                isTeamFull={team.players.length === this.props.teamSize}
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
