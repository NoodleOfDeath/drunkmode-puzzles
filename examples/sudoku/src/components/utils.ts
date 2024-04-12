import { SudokuGrid, SudokuValue } from './types';

export const SUDOKU_DIFFICULTIES = {
  easy: 20,
  hard: 40,
  medium: 30,
};

export type SudokuGenerationOptions = {
  difficulty?: keyof typeof SUDOKU_DIFFICULTIES;
  emptyCount?: number;
  size?: number;
};

const shuffle = <T>(array: T[]) => {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex],
    ];
  }
  return array;
};

export const generateEmptyGrid: (size: number) => SudokuGrid = (size = 9) => new Array(size).fill(0).map(() => new Array(size).fill(0));

export const valueIsValidInGrid = (
  board: SudokuGrid,
  size: number,
  row: number,
  col: number,
  num: SudokuValue
) => {
  for (let x = 0; x < size; x++) {
    const sx = 3 * Math.floor(row / 3) + Math.floor(x / 3);
    const sy = 3 * Math.floor(col / 3) + x % 3;
    if (
      (x !== col && board[row][x] === num) ||
      (x !== row && board[x][col] === num) ||
      (sx !== row && sy !== col && board[sx][sy] === num)) {
      return false;
    }
  }
  return true;
};

export const solveGrid = (board: SudokuGrid, size = 9) => {
  const solved = board.map((row) => [...row]);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (solved[row][col] === 0) {
        const nums = shuffle([...Array(size).keys()].map((i) => i + 1) as SudokuValue[]);
        for (const num of nums) {
          if (valueIsValidInGrid(solved, size, row, col, num)) {
            solved[row][col] = num;
            const result = solveGrid(solved) as SudokuGrid;
            if (result) {
              return result;
            } else {
              solved[row][col] = 0;
            }
          }
        }
        return undefined;
      }
    }
  }
  return solved;
};

export const generateSudokuPuzzle = ({
  difficulty = 'easy',
  emptyCount = SUDOKU_DIFFICULTIES[difficulty],
  size = 9,
}: SudokuGenerationOptions = {}) => {

  const solution = solveGrid(generateEmptyGrid(size));

  if (!solution) {
    throw new Error('Failed to generate a solution');
  }

  const board = [...solution.map((row) => [...row])];

  for (let i = 0; i < emptyCount; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const prev = board[x][y];
    if (prev !== 0) {
      board[x][y] = 0;
      const result = solveGrid(board);
      if (!result) {
        board[x][y] = prev;
        i--;
      }
    } else {
      i--;
    }
  }

  return {
    startingValues: board,
    values: board,
  };
};
