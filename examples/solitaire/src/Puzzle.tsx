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

export const Puzzle = ({
  config,
  data,
  onConfig,
  onProgress,
  onFailure,
  onSuccess,
  ...props
}: PuzzleProps) => {
  return (
    <StyledContainer>
      {props.preview && (
        <React.Fragment>
          <div>
            User is previewing the puzzle. Display any
            configurations here that the user should set like 
            puzzle difficulty
          </div>
          <div>
            Use the onConfig function to update the 
            puzzle configurations
          </div>
        </React.Fragment>
      )}
      <div>Your Puzzle Goes Here</div>
      <div>
        Use the onProgress function to update the puzzle progress
        so that the user does not have to start over if they close
        the puzzle
      </div>  
      <button onClick={ () => onFailure() }>Press me to fail the puzzle</button>
      <button onClick={ () => onSuccess() }>Press me to succeed the puzzle</button>
    </StyledContainer>
  );
};
 