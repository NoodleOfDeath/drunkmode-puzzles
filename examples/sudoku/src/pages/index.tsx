// do not modify this file
// only modify the Puzzle component
import React from 'react';

import { PuzzleCanvas } from 'drunkmode-puzzles';

import { SudokuPuzzle } from '~/SudokuPuzzle';

const Index = () => {
  return (
    <PuzzleCanvas puzzle={ SudokuPuzzle } />
  );
};
 
export default Index;