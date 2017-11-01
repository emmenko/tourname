import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import styled from 'styled-components';
import { compose } from 'recompose';
import withUser from '../with-user';
import Loading from '../loading';
import Welcome from '../welcome';

const View = styled.div`
  > * + * {
    margin: 16px 0 0 0;
  }
`;
const Section = styled.div`
  display: flex;
  justify-content: space-between;
`;
const SectionBlock = styled.div`
  flex: 1;
`;
const SectionBlockTitle = styled.h3``;
const Button = styled.button``;
const List = styled.ul``;
const ListItem = styled.li``;
const TextPrimary = styled.div`
  font-size: 1.25rem;
  font-weigth: bold;
`;
const TextDetail = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const TournamentsOverview = gql`
  query TournamentsOverview($key: String!) {
    organizationByKey(key: $key) {
      id
      activeTournaments {
        ...TournamentInfo
      }
      finishedTournaments {
        ...TournamentInfo
      }
    }
  }

  fragment TournamentInfo on TournamentInfo {
    id
    discipline
    name
    status
    size
    teamSize
  }
`;

class Dashboard extends React.PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        organizationKey: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    fullName: PropTypes.string.isRequired,
    tournaments: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      organizationByKey: PropTypes.shape({
        activeTournaments: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            discipline: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            size: PropTypes.string.isRequired,
            teamSize: PropTypes.number.isRequired,
          })
        ).isRequired,
        finishedTournaments: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            discipline: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            size: PropTypes.string.isRequired,
            teamSize: PropTypes.number.isRequired,
          })
        ).isRequired,
      }),
    }),
  };

  renderActiveTournamentsList = () => {
    const { activeTournaments } = this.props.tournaments.organizationByKey;
    if (activeTournaments.length === 0)
      return <div>{'There are no active tournaments at the moment'}</div>;
    return (
      <List>
        {activeTournaments.map(tournament => (
          <Link
            key={tournament.id}
            to={`/${this.props.match.params
              .organizationKey}/tournaments/${tournament.id}`}
          >
            <ListItem>
              <TextPrimary>{tournament.name}</TextPrimary>
              <TextDetail>{tournament.discipline}</TextDetail>
            </ListItem>
          </Link>
        ))}
      </List>
    );
  };

  renderFinishedTournamentsList = () => {
    const { finishedTournaments } = this.props.tournaments.organizationByKey;
    if (finishedTournaments.length === 0)
      return <div>{'There are no finished tournaments at the moment'}</div>;
    return (
      <List>
        {finishedTournaments.map(tournament => (
          <Link
            key={tournament.id}
            to={`/${this.props.match.params
              .organizationKey}/tournaments/${tournament.id}`}
          >
            <ListItem>
              <TextPrimary>{tournament.name}</TextPrimary>
              <TextDetail>{tournament.discipline}</TextDetail>
            </ListItem>
          </Link>
        ))}
      </List>
    );
  };

  render() {
    return (
      <View>
        <Section>
          <Welcome name={this.props.fullName} />
          {/* TODO: show some statistics (and maybe a chart?), e.g.:
        - number of tournaments played
        - number of wins
        - number of active tournaments
      */}
        </Section>
        <Section>
          <SectionBlock>
            <SectionBlockTitle>{'Active tournaments'}</SectionBlockTitle>
            {this.props.tournaments.loading ? (
              <Loading />
            ) : (
              this.renderActiveTournamentsList()
            )}
          </SectionBlock>
          <SectionBlock>
            <SectionBlockTitle>{'Finished tournaments'}</SectionBlockTitle>
            {this.props.tournaments.loading ? (
              <Loading />
            ) : (
              this.renderFinishedTournamentsList()
            )}
          </SectionBlock>
        </Section>
        <Section>
          <Link to={`/new`}>
            <Button>{'Create new tournament'}</Button>
          </Link>
        </Section>
      </View>
    );
  }
}

export default compose(
  withRouter,
  withUser(data => ({ fullName: data.me.name })),
  graphql(TournamentsOverview, {
    name: 'tournaments',
    options: ownProps => ({
      variables: {
        key: ownProps.match.params.organizationKey,
      },
    }),
  })
)(Dashboard);
