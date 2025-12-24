import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

// -- TYPES --

type Point = { x: number; y: number };
type Direction = 'DOWN' | 'LEFT' | 'RIGHT' | 'UP';
type Difficulty = 'easy' | 'hard' | 'medium';

const GRID_SIZE = 20;

const LEVELS = {
  easy: {
    goal: 5, speed: 200, speedIncrement: 2, 
  },
  hard: {
    goal: 15, speed: 100, speedIncrement: 6, 
  },
  medium: {
    goal: 10, speed: 150, speedIncrement: 4, 
  },
};

// -- STYLED COMPONENTS (Matched to WordsearchPuzzle) --

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #f0f2f5;
  color: #333;
  font-family: 'Anton', sans-serif; /* Matching app vibe */
  user-select: none;
  touch-action: none;
  height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_SIZE}, 1fr);
  grid-template-rows: repeat(${GRID_SIZE}, 1fr);
  width: 90vw;
  height: 90vw;
  max-width: 400px;
  max-height: 400px;
  background: white;
  border: 4px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
`;

const Cell = styled.div`
  width: 100%;
  height: 100%;
`;

const SnakeSegment = styled.div`
  background-color: #4caf50;
  width: 100%;
  height: 100%;
  border-radius: 2px;
`;

const Food = styled.div`
  background-color: #ff5722;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transform: scale(0.8);
`;

const PreviewControls = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
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
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  z-index: 10;
`;

const OverlayText = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

// -- LOGIC --

export const Puzzle = ({
  config,
  onConfig,
  onFailure,
  onSuccess,
  preview,
}: PuzzleProps) => {

  // Configuration
  const [difficulty, setDifficulty] = useState<Difficulty>((config?.difficulty as Difficulty) || 'medium');
  const levelSettings = LEVELS[difficulty] || LEVELS.medium;

  // Game State
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Refs for loop
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<Point | null>(null);

  // Initialize/Reset
  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  // Update Config
  useEffect(() => {
    if (config?.difficulty) {
      setDifficulty(config.difficulty as Difficulty);
    }
  }, [config?.difficulty]);

  // Generate Food
  const generateFood = (currentSnake: Point[]): Point => {
    let newFood: Point;
    let placed = false;
    while (!placed) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        placed = true;
        return newFood;
      }
    }
    return { x: 0, y: 0 }; // Fallback
  };

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    onFailure && onFailure({ message: 'Game Over! You crashed.' });
  }, [onFailure]);

  const handleWin = useCallback(() => {
    setIsPlaying(false);
    onSuccess && onSuccess({ message: `Puzzle Solved! Score: ${levelSettings.goal}` });
  }, [levelSettings.goal, onSuccess]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        // Apply direction logic (using nextDirection to prevent 180 turns in one tick)
        setDirection(nextDirection);
        switch (nextDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
        }

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 1;
          setScore(newScore);
          
          // Check Win Condition
          if (newScore >= levelSettings.goal) {
            handleWin();
            return newSnake;
          }

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const currentSpeed = Math.max(50, levelSettings.speed - (score * levelSettings.speedIncrement));
    gameLoopRef.current = setInterval(moveSnake, currentSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, nextDirection, food, score, levelSettings, difficulty, handleGameOver, handleWin]);

  const handleManualControl = (dir: Direction) => {
    switch (dir) {
    case 'UP': if (direction !== 'DOWN') {
      setNextDirection('UP');
    } break;
    case 'DOWN': if (direction !== 'UP') {
      setNextDirection('DOWN');
    } break;
    case 'LEFT': if (direction !== 'RIGHT') {
      setNextDirection('LEFT');
    } break;
    case 'RIGHT': if (direction !== 'LEFT') {
      setNextDirection('RIGHT');
    } break;
    }
  };

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
      case 'ArrowUp': if (direction !== 'DOWN') {
        setNextDirection('UP');
      } break;
      case 'ArrowDown': if (direction !== 'UP') {
        setNextDirection('DOWN');
      } break;
      case 'ArrowLeft': if (direction !== 'RIGHT') {
        setNextDirection('LEFT');
      } break;
      case 'ArrowRight': if (direction !== 'LEFT') {
        setNextDirection('RIGHT');
      } break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Touch Controls (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      return;
    }

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchEnd.x - touchStartRef.current.x;
    const diffY = touchEnd.y - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal
      if (diffX > 0 && direction !== 'LEFT') {
        setNextDirection('RIGHT');
      } else if (diffX < 0 && direction !== 'RIGHT') {
        setNextDirection('LEFT');
      }
    } else {
      // Vertical
      if (diffY > 0 && direction !== 'UP') {
        setNextDirection('DOWN');
      } else if (diffY < 0 && direction !== 'DOWN') {
        setNextDirection('UP');
      }
    }

    touchStartRef.current = null;
  };

  return (
    <Container onTouchStart={ handleTouchStart } onTouchEnd={ handleTouchEnd }>
      
      {preview && (
        <PreviewControls>
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <Button
              key={ d }
              $active={ difficulty === d }
              onClick={ () => {
                setDifficulty(d);
                onConfig && onConfig({ ...config, difficulty: d });
                resetGame(); // Reset on difficulty change
                setIsPlaying(false); // require explicit start
              } }>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Button>
          ))}
        </PreviewControls>
      )}

      <Header>
        Score: 
        {' '}
        {score}
        {' '}
        / 
        {' '}
        {levelSettings.goal}
      </Header>

      <GameBoard>
        {gameOver && (
          <Overlay>
            <OverlayText>GAME OVER</OverlayText>
            <Button onClick={ resetGame }>Try Again</Button>
          </Overlay>
        )}
        
        {!isPlaying && !gameOver && score === 0 && (
          <Overlay>
            <OverlayText>SNAKE</OverlayText>
            <Button onClick={ resetGame }>START</Button>
            <div style={ {
              fontSize: '0.8rem', marginTop: 10, opacity: 0.8, 
            } }>
              Swipe or Tap to Move
            </div>
          </Overlay>
        )}

        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <Cell key={ i }>
              {isSnake && <SnakeSegment />}
              {isFood && <Food />}
            </Cell>
          );
        })}
      </GameBoard>

      {/* On-Screen Controls */}
      <div style={ {
        display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20, maxWidth: 200, 
      } }>
        <div />
        <Button onClick={ () => handleManualControl('UP') }>▲</Button>
        <div />
        <Button onClick={ () => handleManualControl('LEFT') }>◀</Button>
        <Button onClick={ () => handleManualControl('DOWN') }>▼</Button>
        <Button onClick={ () => handleManualControl('RIGHT') }>▶</Button>
      </div>

      <div style={ { marginTop: 20 } }>
        <Button 
          onClick={ () => {
            if (window.confirm('Are you sure you want to reset the game?')) {
              resetGame();
            }
          } }
          style={ { backgroundColor: '#f44336' } }>
          Reset Game
        </Button>
      </div>
      
      {preview && (
        <div style={ { marginTop: 20 } }>
          <Button onClick={ () => onSuccess({ message: 'Debug Win' }) }>Debug Win</Button>
        </div>
      )}

    </Container>
  );
};