import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

type Tower = number[];

export type TowersOfHanoiProps = PuzzleProps & {
  numberOfDisks?: number;
  numberOfTowers?: number;
  diskHeight?: number;
};

export type DiskProps = {
  size: number;
  height?: number;
  color?: string;
};

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const StyledTower = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

const StyledDiskContainer = styled.div<Partial<TowersOfHanoiProps>>`
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: center;
  min-height: ${ ({ numberOfDisks = 0, diskHeight = 20 }) => numberOfDisks * diskHeight }px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled.button`
  background: #f1f1f1;
  border: none;
  border-radius: 5px;
  padding: 0.5rem;
`;

export const Disk = ({
  size,
  height = 20,
  color = 'red', 
}: DiskProps) => {
  return (
    <div style={ { 
      background: color,
      height,
      width: `${size * 20}px`,
    } } />
  );
};

export const TowersOfHanoi: React.FC<TowersOfHanoiProps> = ({
  // onConfig,
  onProgress,
  onFailure,
  onSuccess,
  startFresh,
  // config,
  data,
  numberOfDisks = 5,
  numberOfTowers = 3,
  diskHeight = 20,
}) => {
 
  const [loaded, setLoaded] = React.useState(false);
  const [towers, setTowers] = React.useState<Tower[]>([
    Array.from({ length: numberOfDisks }, (_, i) => numberOfDisks - i),
    ...Array.from({ length: numberOfTowers - 1 }, () => []),
  ]);

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
      if (fromDisk < (toDisk ?? 9999)) {
        state[to].push(fromDisk);
        state[from].pop();
      } else {
        onFailure();
      }
      onProgress?.(state);
      return state;
    });
  };

  React.useEffect(() => {
    if (towers[numberOfTowers - 1].length === numberOfDisks) {
      onSuccess();
    }
  }, [towers, onSuccess, numberOfDisks, numberOfTowers]);

  React.useEffect(() => {
    if (startFresh) {
      setTowers([
        Array.from({ length: numberOfDisks }, (_, i) => numberOfDisks - i),
        ...Array.from({ length: numberOfTowers - 1 }, () => []),
      ]);
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
        setTowers([
          Array.from({ length: numberOfDisks }, (_, i) => numberOfDisks - i),
          ...Array.from({ length: numberOfTowers - 1 }, () => []),
        ]);
      } finally {
        setLoaded(true);
      }
    }
  }, [startFresh, data, loaded, numberOfDisks, numberOfTowers]);

  return (
    <StyledContainer>
      {towers.map((tower, index) => (
        <StyledTower key={ index }>
          <StyledDiskContainer
            numberOfDisks={ numberOfDisks }
            diskHeight={ diskHeight }>
            {tower.map((disk, i) => (
              <Disk
                key={ i }
                size={ disk }
                height={ diskHeight } />
            ))}
            <div style={ {
              background: 'black', 
              height: numberOfDisks * diskHeight + 10,
              position: 'absolute',
              width: '5px',
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
  );
};