import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

import { Board } from './Board';
import { generateSudokuPuzzle } from './utils';

export type SudokuValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SudokuGrid = SudokuValue[][];

export type SudokuPuzzleProps = PuzzleProps & {
  values?: SudokuGrid;
  startingValues?: SudokuGrid;
  solution?: SudokuGrid;
};

const StyledDifficulties = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  align-self: center;
`;

const StyledButton = styled.button`
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 1rem;
`;

export const SudokuPuzzle = ({
  startFresh,
  config,
  data,
  values = [],
  startingValues = [],
  solution = [],
  onConfig,
  ...props
}: SudokuPuzzleProps) => {
  
  const { difficulty: difficulty0 = 'easy' } = { ...config };
  
  const [difficulty, setDifficulty] = React.useState(difficulty0);
  const [loaded, setLoaded] = React.useState(false);
  const [puzzle, setPuzzle] = React.useState<ReturnType<typeof generateSudokuPuzzle> & { values?: SudokuGrid }>({
    solution, startingValues, values, 
  });
  
  React.useEffect(() => {
    if (startFresh) {
      setPuzzle(generateSudokuPuzzle({ difficulty }));
    }
    if (loaded) {
      return;
    }
    setLoaded(true);
    if (data) {
      try {
        const {
          startingValues, solution, values, 
        } = JSON.parse(data);
        setPuzzle({
          solution, startingValues, values, 
        });
      } catch (e) {
        alert('there was an issue loading puzzle progress');
        setPuzzle(generateSudokuPuzzle({ difficulty }));
      }
    }
  }, [startFresh, difficulty, data, loaded]);
  
  return (
    <React.Fragment>
      {props.preview || true && (
        <StyledDifficulties>
          {['easy', 'medium', 'hard'].map((diff) => (
            <StyledButton
              key={ diff }
              style={ { 
                backgroundColor: difficulty === diff ? 'black' : 'white', 
                color: difficulty === diff ? 'white' : 'black', 
              } }
              onClick={ () => {
                setDifficulty(diff);
                onConfig?.({ difficulty: diff });
              } }>
              { diff }
            </StyledButton>
          ))}
        </StyledDifficulties>
      )}
      <Board
        { ...puzzle }
        { ...props } />
    </React.Fragment>
  );
};