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

const StyledMain = styled('main') <{ height: number }>`
  display: flex;
  flex-direction: column;
  min-height: ${({ height }) => height}px;
`;

export const PuzzleCanvas = ({ puzzle: ChildComponent }: PuzzleCanvasProps) => {

  const [env, setEnv] = React.useState<PuzzleEnv>();
  const [layout, setLayout] = React.useState(ZERO_LAYOUT);

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

  return (
    <StyledMain height= { layout.height } >
      <ChildComponent
        preview={ env?.preview }
        config = { env?.config }
        data = { env?.data }
        startFresh = { !!env?.preview || !env?.data
        }
        onConfig = { (data) => PuzzleMessage.onConfig({
          ...env?.config,
          ...data,
        }) }
        onProgress = { (data) => PuzzleMessage.onProgress(data) }
        onFailure = { (data) => PuzzleMessage.onFailure(data) }
        onSuccess = { (data) => PuzzleMessage.onSuccess(data) } />
    </StyledMain>
  );
};