import React from 'react';

import styled from 'styled-components';

import {
  PuzzleEnv,
  PuzzleMessage,
  PuzzleProps,
} from './types';

type Layout = {
  width: number;
  height: number;
};

export type PuzzleCanvasProps = {
  puzzle: React.ComponentType<PuzzleProps>;
};

const ZERO_LAYOUT: Layout = { height: 0, width: 0 };

const StyledMain = styled('main')<{ height: number; colorScheme: 'dark' | 'light' }>`
  display: flex;
  flex-direction: column;
  min-height: ${({ height }) => height}px;
  background-color: ${({ colorScheme }) => colorScheme === 'dark' ? '#111111' : '#ffffff' },
`;

export const PuzzleCanvas = ({ puzzle: ChildComponent }: PuzzleCanvasProps) => {

  const [env, setEnv] = React.useState<PuzzleEnv>();
  const [layout, setLayout] = React.useState(ZERO_LAYOUT);
  const [colorScheme, setColorScheme] = React.useState<string>();

  React.useLayoutEffect(() => {
    const updateLayout = () => {
      setLayout((prev) => {
        if (prev?.width === window.innerWidth &&
          prev?.height === window.innerHeight) {
          return prev;
        }
        const newSize = {
          height: window.innerHeight,
          width: window.innerWidth,
        };
        return newSize;
      });
    };
    window.addEventListener('resize', updateLayout);
    updateLayout();
    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  React.useEffect(() => {
    const env = new PuzzleEnv();
    setEnv(env);
  }, []);
  
  React.useEffect(() => {
    const updateColorScheme = (e) => {
      setColorScheme(e.matches ? 'dark' : 'light')
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColorScheme);
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateColorScheme);
    }
  }, []);

  return (
    <StyledMain 
      height={ layout.height } 
      colorScheme={ env?.colorScheme || colorScheme }>
      <ChildComponent
        preview={ env?.preview }
        config = { env?.config }
        data = { env?.data }
        startFresh = { !!env?.preview || !env?.data }
        onConfig = { (data) => PuzzleMessage.onConfig({
          ...env?.config,
          ...data,
        }) }
        onProgress = { (data) => PuzzleMessage.onProgress(data) }
        onMistake = { (data) => PuzzleMessage.onMistake(data) }
        onFailure = { (data) => PuzzleMessage.onFailure(data) }
        onSuccess = { (data) => PuzzleMessage.onSuccess(data) } />
    </StyledMain>
  );
};