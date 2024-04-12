// do not modify this file
// only modify the Puzzle component
import React from 'react';

import { PuzzleCanvas } from 'drunkmode-puzzles';

import { TowersOfHanoiPuzzle } from '~/TowersOfHanoiPuzzle';

const Index = () => {
  return (
    <PuzzleCanvas puzzle={ TowersOfHanoiPuzzle } />
  );
};
 
export default Index;