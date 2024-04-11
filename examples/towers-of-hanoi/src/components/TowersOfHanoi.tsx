import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

export type TowersOfHanoiProps = PuzzleProps & {
  numberOfDisks?: number;
  numberOfTowers?: number;
  blockWidth?: number;
  diskHeight?: number;
};

export type DiskProps = {
  size: number;
  blockWidth?: number;
  height?: number;
  color?: string;
};

type Tower = DiskProps[];

const StyledPuzzle = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const StyledTower = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

const StyledDiskContainer = styled.div<Partial<TowersOfHanoiProps>>`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: flex-start;
  min-height: ${ ({ numberOfDisks = 0, diskHeight = 20 }) => numberOfDisks * diskHeight }px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
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

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'];

export const Disk = ({
  size,
  blockWidth = 20,
  height = 20,
  color = COLORS[Math.floor(Math.random() * COLORS.length)], 
}: DiskProps) => {
  return (
    <div style={ { 
      background: color,
      height,
      outline: '1px solid black',
      width: `${size * blockWidth}px`,
    } } />
  );
};

export const TowersOfHanoi: React.FC<TowersOfHanoiProps> = ({
  onConfig,
  onProgress,
  onFailure,
  onSuccess,
  startFresh,
  config,
  data,
  numberOfDisks: numberOfDisks0 = 5,
  numberOfTowers = 3,
  blockWidth = 20,
  diskHeight = 20,
  ...props
}) => {
 
  const [difficulty, setDifficulty] = React.useState(config?.difficulty ?? 'easy');
  const [loaded, setLoaded] = React.useState(false);
  const [towers, setTowers] = React.useState<Tower[]>([
    Array.from({ length: numberOfDisks0 }, (_, i) => ({ size: numberOfDisks0 - i })),
    ...Array.from({ length: numberOfTowers - 1 }, () => []),
  ]);

  const numberOfDisks = React.useMemo(() => difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8, [difficulty]);

  const reset = React.useCallback(() => {
    setTowers([
      Array.from({ length: numberOfDisks }, (_, i) => ({ 
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: numberOfDisks - i,
      })),
      ...Array.from({ length: numberOfTowers - 1 }, () => []),
    ]);
  }, [numberOfDisks, numberOfTowers]);

  const moveDisk = (from: number, to: number) => {
    setTowers((prev) => {
      const state = [...prev];
      const fromLength = state[from].length - 1;
      const fromDisk = state[from][fromLength];
      const toLength = state[to].length - 1;
      const toDisk = state[to][toLength];
      if (!fromDisk) {
        return state;
      }
      if (fromDisk.size < (toDisk?.size ?? 9999)) {
        state[to].push(fromDisk);
        state[from].pop();
      } else {
        onFailure();
      }
      onProgress?.({ towers: state });
      return state;
    });
  };

  const handleRestart = React.useCallback(() => {
    if (window.confirm('Are you sure you want to reset your progress? This cannot be undone')) {
      reset();
    }
  }, [reset]);
  
  const handleNewGame = React.useCallback(() => {
    if (window.confirm('Are you sure you want to start a new game? You will lose all curren progress')) {
      reset();
    }
  }, [reset]);

  React.useEffect(() => {
    if (towers[numberOfTowers - 1].length === numberOfDisks) {
      onSuccess();
    }
  }, [towers, onSuccess, numberOfDisks, numberOfTowers]);

  React.useEffect(() => {
    if (startFresh) {
      reset();
    }
    if (loaded) {
      return;
    }
    if (data) {
      try {
        console.log(data);
        const { towers } = typeof data === 'string' ? JSON.parse(data) : data;
        setTowers(towers);
      } catch (e) {
        alert('there was an issue loading puzzle progress');
        reset();
      } finally {
        setLoaded(true);
      }
    }
  }, [startFresh, data, loaded, numberOfDisks, numberOfTowers, reset, difficulty]);

  return (
    <StyledPuzzle>
      {props.preview ? (
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
      ) : (
        <StyledDifficulties>
          <StyledButton>
            {`Difficulty: ${difficulty}`}
          </StyledButton>
        </StyledDifficulties>
      )}
      <StyledContainer>
        {towers.map((tower, index) => (
          <StyledTower key={ index }>
            <StyledDiskContainer
              numberOfDisks={ numberOfDisks }
              diskHeight={ diskHeight }>
              {tower.map((disk, i) => (
                <Disk
                  key={ i }
                  { ...disk }
                  blockWidth={ blockWidth }
                  height={ diskHeight } />
              ))}
              <div style={ {
                background: 'black', 
                height: numberOfDisks * diskHeight + 10,
                position: 'absolute',
                width: blockWidth / 5,
              } } />
            </StyledDiskContainer>
            <StyledButtonContainer>
              <StyledButton onClick={ () => moveDisk(index, index - 1 > -1 ? index - 1 : numberOfTowers - 1) }>
                &lt;
              </StyledButton>
              <StyledButton onClick={ () => moveDisk(index, (index + 1) % numberOfTowers) }>
                &gt;
              </StyledButton>
            </StyledButtonContainer>
          </StyledTower>
        ))}
      </StyledContainer>
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