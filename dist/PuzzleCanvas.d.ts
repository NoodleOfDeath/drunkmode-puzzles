import React from 'react';
import { PuzzleProps } from './types';
export type PuzzleCanvasProps = {
    puzzle: React.ComponentType<PuzzleProps>;
};
export declare const PuzzleCanvas: ({ puzzle: ChildComponent }: PuzzleCanvasProps) => import("react/jsx-runtime").JSX.Element;
