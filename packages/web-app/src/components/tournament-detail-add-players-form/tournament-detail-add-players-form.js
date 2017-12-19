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

class TournamentDetailAddPlayersForm extends React.PureComponent {
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
    registeredPlayers: PropTypes.func.isRequired,
    addPlayerToTeam: PropTypes.func.isRequired,
    removePlayerFromTeam: PropTypes.func.isRequired,
  };
  renderTeamFormToAddPlayers = team => {
    const isTeamFull = team.players.length === this.props.teamSize;
    return (
      <div key={team.key}>
        <p>{`Team key: ${team.key}`}</p>
        {team.players.map(player => (
          <div key={player.id}>
            <UserAvatar key="picture" alt="User avatar" src={player.picture} />
            <div>{player.name}</div>
            <div>{player.email}</div>
            <Button
              onClick={() => {
                this.props.removePlayerFromTeam({
                  variables: {
                    tournamentId: this.props.tournamentId,
                    teamKey: team.key,
                    playerId: player.id,
                  },
                });
              }}
            >
              {'Remove from team'}
            </Button>
          </div>
        ))}
        {isTeamFull ? null : (
          <Formik
            initialValues={{ playerId: null }}
            onSubmit={(values, actions) => {
              this.props
                .addPlayerToTeam({
                  variables: {
                    tournamentId: this.props.tournamentId,
                    teamKey: team.key,
                    playerId: values.playerId,
                  },
                })
                .then(
                  () => {
                    actions.setSubmitting(false);
                  },
                  (/* error */) => {
                    actions.setSubmitting(false);
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
