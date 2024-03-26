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

export default function Home() {
  
  const [size, setSize] = React.useState([0, 0]);
  const [coords, setCoords] = React.useState<{ x: number, y: number }>();
  
  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return (
    <StyledMain height={ size[1] }>
      <StyledContainer>
        <StyledTitle>Are you sober?</StyledTitle>
        <StyledButton
          style={ {
            left: coords?.x,
            position: coords ? 'absolute' : undefined,
            top: coords?.y,
          } }
          onClick={ () => {
            setCoords({
              x: Math.floor(Math.random() * (size[0] - 100)) + 10,
              y: Math.floor(Math.random() * (size[1] - 50)) + 10,
            });
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
 