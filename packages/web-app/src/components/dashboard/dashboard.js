import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { compose } from 'recompose';
import withUser from '../with-user';
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

const mockedActiveTournaments = [
  { id: 't3', name: 'Tournament 3' },
  { id: 't5', name: 'Tournament 5' },
];
const mockedPlayedTournaments = [
  { id: 't1', name: 'Tournament 1' },
  { id: 't2', name: 'Tournament 2' },
  { id: 't4', name: 'Tournament 4' },
];

const Dashboard = props => (
  <View>
    <Section>
      <Welcome name={props.fullName} />
      {/* TODO: show some statistics (and maybe a chart?), e.g.:
        - number of tournaments played
        - number of wins
        - number of active tournaments
      */}
    </Section>
    <Section>
      <SectionBlock>
        <SectionBlockTitle>{'Active tournaments'}</SectionBlockTitle>
        {/* TODO: fetch list of active tournaments */}
        <List>
          {mockedActiveTournaments.map(tournament => (
            <ListItem key={tournament.id}>
              <Link
                to={`/${props.match.params
                  .organizationKey}/tournaments/${tournament.id}`}
              >
                {tournament.name}
              </Link>
            </ListItem>
          ))}
        </List>
      </SectionBlock>
      <SectionBlock>
        <SectionBlockTitle>
          {'Tournaments played in the last 30 days'}
        </SectionBlockTitle>
        {/* TODO: fetch list of tournaments played within the last 30 days */}
        <List>
          {mockedPlayedTournaments.map(tournament => (
            <ListItem key={tournament.id}>
              <Link
                to={`/${props.match.params
                  .organizationKey}/tournaments/${tournament.id}`}
              >
                {tournament.name}
              </Link>
            </ListItem>
          ))}
        </List>
      </SectionBlock>
    </Section>
    <Section>
      <Link to={`/new`}>
        <Button>{'Create new tournament'}</Button>
      </Link>
    </Section>
  </View>
);
Dashboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organizationKey: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  fullName: PropTypes.string.isRequired,
};

export default compose(
  withRouter,
  withUser(data => ({ fullName: data.me.name }))
)(Dashboard);
