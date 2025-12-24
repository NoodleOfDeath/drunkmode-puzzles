// do not modify this file
// only modify the Puzzle component
import React from 'react';

import { PuzzleCanvas } from 'drunkmode-puzzles';

import { WordsearchPuzzle } from '~/WordsearchPuzzle';

const Index = () => {
  return (
    <PuzzleCanvas puzzle={ WordsearchPuzzle } />
  );
};
 
export default Index;