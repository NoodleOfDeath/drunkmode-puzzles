import React from 'react';

import { PuzzleMessage } from 'drunkmode-puzzles';
import styled from 'styled-components';

const StyledMain = styled('main')<{ height: number }>`
  display: flex;
  flex-direction: column;
  min-height: ${({ height }) => height}px;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

const StyledTitle = styled.span`
  font-size: 1.5rem;
`;

const StyledButton = styled.button`
  font-size: 1.5rem
`;

type Size = {
  width: number;
  height: number;
};

const ZERO_SIZE: Size = { height: 0, width: 0 };

type Point = {
  x: number;
  y: number;
};

export default function Home() {
  
  const [size, setSize] = React.useState(ZERO_SIZE);
  const [coords, setCoords] = React.useState<Point>();
  const [yesCount, setYesCount] = React.useState(0);
  const yesButtonRef = React.useRef<HTMLButtonElement>(null);
  
  const moveButton = React.useCallback((size: Size) => {
    const buttonDims = yesButtonRef.current?.getBoundingClientRect() ?? ZERO_SIZE;
    const padding = 10;
    setCoords({
      x: Math.floor(Math.random() * (size.width - buttonDims.width)) + padding,
      y: Math.floor(Math.random() * (size.height - buttonDims.height)) + padding,
    });
  }, []);
  
  React.useLayoutEffect(() => {
    function updateSize() {
      setSize((prev) => {
        if (prev.width === window.innerWidth && 
            prev.height === window.innerHeight) {
          return prev;
        }
        const newSize = {
          height: window.innerHeight,
          width: window.innerWidth,
        };
        if (coords) {
          moveButton(newSize);
        }
        return newSize;
      });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [coords, moveButton]);

  React.useEffect(() => {
    if (yesCount > 0 && yesCount % 5 === 0) {
      PuzzleMessage.onFailure({ message: 'Bruh, stop cappin\'! You know you ain\'t sober!' });
    }
  }, [yesCount]);
  
  return (
    <StyledMain height={ size.height }>
      <StyledContainer>
        <StyledTitle>
          Are you sober?
        </StyledTitle>
        <StyledButton
          ref={ yesButtonRef }
          style={ {
            left: coords?.x,
            position: coords ? 'absolute' : undefined,
            top: coords?.y,
          } }
          onClick={ () => {
            setYesCount((prev) => prev + 1);
            moveButton(size);
          } }>
          Yes
        </StyledButton>
        <button 
          onClick={ () => PuzzleMessage.onSuccess({ message: 'You succeeded!' }) }>
          No, I&apos;m Drunk AF
        </button>
      </StyledContainer>
    </StyledMain>
  );
}
 