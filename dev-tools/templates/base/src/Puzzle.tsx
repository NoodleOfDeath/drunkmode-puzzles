import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

export const Puzzle = ({ ...props }: PuzzleProps) => {
  return (
    <StyledContainer>
      Test
    </StyledContainer>
  );
};
 