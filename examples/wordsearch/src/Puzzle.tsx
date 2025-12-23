import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

// -- STYLED COMPONENTS --

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #f0f2f5;
  color: #333;
  font-family: sans-serif;
  user-select: none;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  color: #1a1a1a;
`;

const Grid = styled.div<{ $size: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, 1fr);
  gap: 4px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  max-width: 90vw;
  touch-action: none; /* Prevent scroll on mobile while dragging */
`;

const Cell = styled.div<{ $selected: boolean; $found: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  background-color: ${props => props.$found ? '#4caf50' : props.$selected ? '#2196f3' : '#e0e0e0'};
  color: ${props => props.$found || props.$selected ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    filter: brightness(0.9);
  }

  @media (max-width: 400px) {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
`;

const WordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const WordItem = styled.span<{ $found: boolean }>`
  font-size: 1rem;
  text-decoration: ${props => props.$found ? 'line-through' : 'none'};
  color: ${props => props.$found ? '#aaa' : '#333'};
  font-weight: ${props => props.$found ? 'normal' : 'bold'};
  padding: 4px 8px;
  background: ${props => props.$found ? 'transparent' : 'white'};
  border-radius: 12px;
  box-shadow: ${props => props.$found ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'};
`;

const PreviewControls = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#2196f3' : '#333'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  opacity: ${props => props.$active ? 1 : 0.8};

  &:hover {
    opacity: 1;
  }
`;

// -- LOGIC --

const LEVELS = {
  easy: { count: 3, size: 6 },
  hard: { count: 5, size: 10 },
  medium: { count: 4, size: 8 },
};

const WORDS_POOL = [
  'DRUNK',
  'WATER',
  'TAXI',
  'HOME',
  'BED',
  'PIZZA',
  'UBER',
  'SOS',
  'BEER',
  'WINE',
  'SHOTS',
  'PARTY',
  'SLEEP',
  'FOOD',
  'SAFE',
];

type Difficulty = 'easy' | 'hard' | 'medium';

// Function to generate grid and hide words
const generateGame = (wordsToHide: string[], gridSize: number) => {
  const grid = Array(gridSize * gridSize).fill('');
  const placedWords: { word: string, indices: number[] }[] = [];

  for (const word of wordsToHide) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const direction = Math.random() > 0.5 ? 'H' : 'V'; // Horizontal or Vertical
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      const indices: number[] = [];
      let valid = true;

      for (let i = 0; i < word.length; i++) {
        let r = startRow;
        let c = startCol;
        if (direction === 'H') {
          c += i;
        } else {
          r += i;
        }

        if (c >= gridSize || r >= gridSize) {
          valid = false;
          break;
        }

        const idx = r * gridSize + c;
        if (grid[idx] !== '' && grid[idx] !== word[i]) {
          valid = false;
          break;
        }
        indices.push(idx);
      }

      if (valid) {
        indices.forEach((idx, i) => grid[idx] = word[i]);
        placedWords.push({ indices, word });
        placed = true;
      }
    }
  }

  // Fill empty spaces
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === '') {
      grid[i] = letters[Math.floor(Math.random() * letters.length)];
    }
  }

  return { grid, placedWords };
};

export const Puzzle = ({
  config,
  onConfig,
  onFailure,
  onSuccess,
  preview,
}: PuzzleProps) => {

  const [difficulty, setDifficulty] = useState<Difficulty>((config?.difficulty as Difficulty) || 'medium');
  const levelSettings = LEVELS[difficulty] || LEVELS.medium;
  const gridSize = levelSettings.size;

  const [words, setWords] = useState<string[]>([]);
  const [gridChars, setGridChars] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<{ word: string, indices: number[] }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  // Selection State
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [currentSelection, setCurrentSelection] = useState<number[]>([]);

  // Track start cell specifically for drag logic
  const dragStartRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<'lost' | 'playing' | 'won'>('playing');

  // Initialize Game
  useEffect(() => {
    // Pick specific number of random words based on difficulty
    const shuffled = [...WORDS_POOL].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, levelSettings.count);
    setWords(selectedWords);

    const { grid, placedWords } = generateGame(selectedWords, levelSettings.size);
    setGridChars(grid);
    setSolutions(placedWords);
    setFoundWords([]);
    setGameState('playing');
    setSelectionStart(null);
    setCurrentSelection([]);
    setIsDragging(false);
  }, [preview, difficulty, levelSettings.count, levelSettings.size]);

  // Sync difficulty from config
  useEffect(() => {
    if (config?.difficulty) {
      setDifficulty(config.difficulty as Difficulty);
    }
  }, [config?.difficulty]);

  // Timer

  // Check Win Condition
  useEffect(() => {
    if (words.length > 0 && foundWords.length === words.length && gameState === 'playing') {
      setGameState('won');
      onSuccess({ message: 'You found all the words! Good job.' });
    }
  }, [foundWords, words, gameState, onSuccess]);

  // Helper to calculate selection path between two points
  const getSelectionPath = (start: number, end: number) => {
    const startRow = Math.floor(start / gridSize);
    const startCol = start % gridSize;
    const endRow = Math.floor(end / gridSize);
    const endCol = end % gridSize;

    const diffRow = endRow - startRow;
    const diffCol = endCol - startCol;

    // Check for valid straight lines (Horizontal, Vertical, Diagonal)
    if (diffRow !== 0 && diffCol !== 0 && Math.abs(diffRow) !== Math.abs(diffCol)) {
      // Invalid diagonal/angle -> Just select the single end cell or keep start
      return [start];
    }

    const steps = Math.max(Math.abs(diffRow), Math.abs(diffCol));
    const rowStep = diffRow === 0 ? 0 : diffRow / steps;
    const colStep = diffCol === 0 ? 0 : diffCol / steps;

    const pathIndices: number[] = [];
    for (let i = 0; i <= steps; i++) {
      pathIndices.push((startRow + i * rowStep) * gridSize + (startCol + i * colStep));
    }
    return pathIndices;
  };

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (gameState !== 'playing') {
      return;
    }

    // Check if this is a "Tap end to complete" scenario (legacy/tap-tap flexibility)
    // If not dragging, and we have a start selected, and clicked a DIFFERENT cell...
    if (selectionStart !== null && index !== selectionStart && !isDragging) {
      // Complete the selection instantly (Tap-Tap mode)
      finalizeSelection(selectionStart, index);
      return;
    }

    // Otherwise, start a new drag/selection
    e.currentTarget.releasePointerCapture(e.pointerId); // Allow smooth drag over other cells
    // Actually for pointer events on grid, capturing usually helps tracking, but we want 'enter' on other cells.
    // React's onPointerEnter works best if we DON'T capture, or if we do hit-testing.
    // Let's try standard behavior.

    setIsDragging(true);
    setSelectionStart(index);
    dragStartRef.current = index;
    setCurrentSelection([index]);
  };

  const handlePointerEnter = (index: number) => {
    if (gameState !== 'playing' || !isDragging || selectionStart === null) {
      return;
    }

    const path = getSelectionPath(selectionStart, index);
    setCurrentSelection(path);
  };

  const handlePointerUp = () => {
    if (gameState !== 'playing' || !isDragging || selectionStart === null) {
      if (isDragging) {
        setIsDragging(false);
      } // safety reset
      return;
    }

    // Finalize the drag
    const end = currentSelection[currentSelection.length - 1]; // Last cell in path
    finalizeSelection(selectionStart, end);
    setIsDragging(false);
  };

  const finalizeSelection = (start: number, end: number) => {
    const pathIndices = getSelectionPath(start, end);

    // Check word
    const selectedWord = pathIndices.map(i => gridChars[i]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    let found = false;
    words.forEach(word => {
      if (!foundWords.includes(word) && (word === selectedWord || word === reversedWord)) {
        setFoundWords(prev => [...prev, word]);
        found = true;
      }
    });

    // Clear selection visual logic
    // If we want "Tap-Tap" to be sticky, we should only clear if found or invalid.
    // But user asked for drag. Standard drag clears on release.
    // For Tap-Tap, we usually keep Start highlighted.
    // Let's compromise: If path length > 1, it was an attempt, so clear.
    // If path length == 1 (just clicked start), leave it selected for potential Tap-Tap.
    if (pathIndices.length > 1 || found) {
      setSelectionStart(null);
      setCurrentSelection([]);
    } else {
      // Keep start selected for Tap-Tap 2nd click
      setCurrentSelection([start]);
    }
  };

  const isFound = (index: number) => {
    for (const sol of solutions) {
      if (foundWords.includes(sol.word)) {
        if (sol.indices.includes(index)) {
          return true;
        }
      }
    }
    return false;
  };

  // Global pointer up to catch releases outside grid
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setSelectionStart(null);
        setCurrentSelection([]);
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isDragging]);

  return (
    <Container>
      {preview && (
        <PreviewControls>
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <Button
              key={d}
              $active={difficulty === d}
              onClick={() => {
                setDifficulty(d);
                onConfig && onConfig({ ...config, difficulty: d });
              }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Button>
          ))}
        </PreviewControls>
      )}

      <Header>
        {gameState === 'won' ? <div>SOLVED</div> : null}
      </Header>

      <WordList>
        {words.map(word => (
          <WordItem key={word} $found={foundWords.includes(word)}>
            {word}
          </WordItem>
        ))}
      </WordList>

      <Grid $size={gridSize} onPointerLeave={() => { /* Optional: cancel drag if leaves grid? keep it for loose drags */ }}>
        {gridChars.map((char, i) => (
          <Cell
            key={i}
            onPointerDown={(e) => handlePointerDown(i, e)}
            onPointerEnter={() => handlePointerEnter(i)}
            onPointerUp={handlePointerUp}
            $selected={currentSelection.includes(i)}
            $found={isFound(i)}
            style={{ cursor: 'pointer' /* Ensure pointer events fire */ }}>
            {char}
          </Cell>
        ))}
      </Grid>

      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Drag to select OR Tap start then end.
      </div>

    </Container>
  );
};
