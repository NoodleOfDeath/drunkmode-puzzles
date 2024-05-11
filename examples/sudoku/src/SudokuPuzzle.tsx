import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

import { Board, BoardRef } from './components/Board';
import { SudokuGrid } from './components/types';
import { generateSudokuPuzzle } from './components/utils';

export type SudokuPuzzleProps = PuzzleProps & {
  values?: SudokuGrid;
  startingValues?: SudokuGrid;
};

const StyledPuzzle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

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

const StyledRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

export const SudokuPuzzle = ({
  startFresh,
  config,
  data,
  values = [],
  startingValues = [],
  onConfig,
  ...props
}: SudokuPuzzleProps) => {
  
  const [difficulty, setDifficulty] = React.useState('medium' ?? config?.difficulty ?? 'easy');
  const [loaded, setLoaded] = React.useState(false);
  const [puzzle, setPuzzle] = React.useState<ReturnType<typeof generateSudokuPuzzle>>({ startingValues, values });
  
  const boardRef = React.useRef<BoardRef>(null);
  
  const handleRestart = React.useCallback(() => {
    if (window.confirm('Are you sure you want to reset your progress? This cannot be undone')) {
      boardRef.current?.reset();
    }
  }, []);
  
  const handleNewGame = React.useCallback(() => {
    if (window.confirm('Are you sure you want to start a new game? You will lose all curren progress')) {
      setPuzzle(generateSudokuPuzzle({ difficulty }));
    }
  }, [difficulty]);
  
  React.useEffect(() => {
    if (startFresh) {
      setPuzzle(generateSudokuPuzzle({ difficulty }));
    }
    if (loaded) {
      return;
    }
    if (data) {
      try {
        console.log(data);
        const { startingValues, values } = typeof data === 'string' ? JSON.parse(data) : data;
        setPuzzle({ startingValues, values });
      } catch (e) {
        alert('there was an issue loading puzzle progress');
        setPuzzle(generateSudokuPuzzle({ difficulty }));
      } finally {
        setLoaded(true);
      }
    }
  }, [startFresh, difficulty, data, loaded]);
  
  React.useEffect(() => {
    setDifficulty(config?.difficulty ?? 'medium');
  }, [config?.difficulty]);
  
  return (
    <StyledPuzzle>
      {props.preview ? (
        <StyledDifficulties>
          {['easy', 'medium', 'hard', 'extreme'].map((diff) => (
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
      ) : (
        <StyledDifficulties>
          <StyledButton>
            {`Difficulty: ${difficulty}`}
          </StyledButton>
        </StyledDifficulties>
      )}
      <Board
        ref={ boardRef }
        range={ difficulty === 'easy' ? 4 : 9 }
        { ...puzzle }
        { ...props } />
      <StyledRow>
        <StyledButton
          onClick={ () => handleRestart() }>
          Restart
        </StyledButton>
        <StyledButton
          onClick={ () => handleNewGame() }>
          New Game
        </StyledButton>
      </StyledRow>
    </StyledPuzzle>
  );
};