// do not modify this file
// only modify the Puzzle component
import React from 'react';

import { PuzzleCanvas } from 'drunkmode-puzzles';

import { RUSoberzPuzzle } from '~/RUSoberzPuzzle';  

const Index = () => {
  return (
    <PuzzleCanvas puzzle={ RUSoberzPuzzle } />
  );
};
 
export default Index;