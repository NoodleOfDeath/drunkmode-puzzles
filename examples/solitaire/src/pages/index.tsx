// do not modify this file
// only modify the Puzzle component
import React from 'react';

import { PuzzleCanvas } from 'drunkmode-puzzles';

import { Puzzle } from '~/SolitairePuzzle';

const Index = () => {
  return (
    <PuzzleCanvas puzzle={ Puzzle } />
  );
};

export default Index;