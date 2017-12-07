import React from 'react';
import styled, { css } from 'styled-components';
import QuickMatchCreate from '../quick-match-create';
import TournamentCreate from '../tournament-create';

const SelectionHeader = styled.div`
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
`;
const HeaderBox = styled.div`
  align-items: center;
  background-color: #fafafa;
  display: flex;
  font-size: 32px;
  height: 250px;
  justify-content: center;
  padding: 16px 32px;
  text-align: center;
  width: 250px;

  ${props =>
    props.size === 'small' &&
    css`
      font-size: 16px;
      height: auto;
      transition: 0.3s font-size, 0.5s height;
    `};
  ${props =>
    props.isSelected &&
    css`
      background-color: blue;
    `};
`;

const MODES = {
  quickMatch: 'quickMatch',
  tournament: 'tournament',
};

class SelectNewTournament extends React.PureComponent {
  static displayName = 'SelectNewTournament';
  state = {
    mode: null,
  };
  selectQuickMatch = () => {
    this.setState({ mode: MODES.quickMatch });
  };
  selectTournament = () => {
    this.setState({ mode: MODES.tournament });
  };
  cancelSelection = () => {
    this.setState({ mode: null });
  };
  render() {
    const isQuickMatchModeSelected =
      this.state.mode && this.state.mode === MODES.quickMatch;
    const isTournamentModeSelected =
      this.state.mode && this.state.mode === MODES.tournament;
    let content;
    if (isQuickMatchModeSelected)
      content = <QuickMatchCreate onCancel={this.cancelSelection} />;
    if (isTournamentModeSelected)
      content = <TournamentCreate onCancel={this.cancelSelection} />;

    return (
      <div>
        <SelectionHeader>
          <HeaderBox
            size={content && 'small'}
            isSelected={isQuickMatchModeSelected}
            onClick={this.selectQuickMatch}
          >
            {'Quick match'}
          </HeaderBox>
          <HeaderBox
            size={content && 'small'}
            isSelected={isTournamentModeSelected}
            onClick={this.selectTournament}
          >
            {'New Tournament'}
          </HeaderBox>
        </SelectionHeader>
        {content}
      </div>
    );
  }
}

export default SelectNewTournament;
