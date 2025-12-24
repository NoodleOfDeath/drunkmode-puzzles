import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import styled from 'styled-components';

// -- TYPES --

type Difficulty = 'easy' | 'hard' | 'medium';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 450;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 12;

const LEVELS = {
  easy: {
    aiPaddleWidth: 40, aiSpeed: 1.25, ballSpeed: 5, goal: 3, playerPaddleWidth: 70, 
  },
  hard: {
    aiPaddleWidth: 60, aiSpeed: 2.75, ballSpeed: 8, goal: 7, playerPaddleWidth: 40, 
  },
  medium: {
    aiPaddleWidth: 50, aiSpeed: 2, ballSpeed: 6, goal: 5, playerPaddleWidth: 50, 
  },
};

// -- STYLED COMPONENTS --

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #0d0221; /* Deep purple/black */
  color: #fff;
  font-family: 'Anton', sans-serif;
  user-select: none;
  touch-action: none;
  height: 100%;
`;

const GameArea = styled.div`
  width: ${GAME_WIDTH}px;
  height: ${GAME_HEIGHT}px;
  background: radial-gradient(circle at center, #26004d 0%, #0d0221 100%);
  border: 4px solid #cc00ff; /* Neon Purple */
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(204, 0, 255, 0.4);
  position: relative;
  overflow: hidden;
`;

const Divider = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(204, 0, 255, 0.3);
  border-top: 2px dashed rgba(204, 0, 255, 0.5);
`;

const Paddle = styled.div.attrs<{ $isPlayer?: boolean; $width: number; $x: number; $y: number }>(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
    width: `${props.$width}px`,
  },
}))<{ $isPlayer?: boolean; $width: number; $x: number; $y: number }>`
  position: absolute;
  height: ${PADDLE_HEIGHT}px;
  background-color: ${props => props.$isPlayer ? '#00f2ff' : '#ff0055'};
  border-radius: 4px;
  box-shadow: 0 0 10px ${props => props.$isPlayer ? '#00f2ff' : '#ff0055'};
`;

const Ball = styled.div.attrs<{ $x: number; $y: number }>(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
}))<{ $x: number; $y: number }>`
  position: absolute;
  width: ${BALL_SIZE}px;
  height: ${BALL_SIZE}px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
`;

const ScoreBoard = styled.div`
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  font-size: 3rem;
  opacity: 0.2;
  font-weight: bold;
  pointer-events: none;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
`;

const Button = styled.button<{ $active?: boolean; $color?: string }>`
  background: ${props => props.$active ? '#cc00ff' : (props.$color || '#333')};
  color: ${props => props.$active ? '#fff' : 'white'};
  border: 1px solid rgba(255,255,255,0.2);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  opacity: ${props => props.$active ? 1 : 0.9};
  transition: all 0.2s;
  font-family: inherit;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 0 15px ${props => props.$color || '#cc00ff'};
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(4px);
`;

const Controls = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
  justify-content: center;
`;

const PreviewControls = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

// -- MAIN COMPONENT --

export const Puzzle = ({
  config,
  onConfig,
  onFailure,
  onSuccess,
  preview,
}: PuzzleProps) => {

  // Config
  const [difficulty, setDifficulty] = useState<Difficulty>((config?.difficulty as Difficulty) || 'medium');
  const levelSettings = LEVELS[difficulty] || LEVELS.medium;

  // State
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [aiX, setAiX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [ball, setBall] = useState({
    dx: 0, dy: 0, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, 
  }); 
  const [scores, setScores] = useState({ ai: 0, player: 0 });
  const [servingSide, setServingSide] = useState<'ai' | 'player' | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<'lose' | 'win' | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  // Refs needed for loop
  const gameStateRef = useRef({
    aiX: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: {
      dx: 0, dy: 0, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, 
    },
    isPlaying: false,
    playerX: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    servingSide: null as 'ai' | 'player' | null,
  });

  // Sync state to ref
  useEffect(() => {
    gameStateRef.current.playerX = playerX;
  }, [playerX]);

  useEffect(() => {
    gameStateRef.current.servingSide = servingSide;
  }, [servingSide]);

  // Sync Difficulty
  useEffect(() => {
    if (config?.difficulty) {
      setDifficulty(config.difficulty as Difficulty);
    }
  }, [config?.difficulty]);

  const resetBall = useCallback((server: 'ai' | 'player') => {
    const state = gameStateRef.current;
    
    // Set Serve State
    setServingSide(server);
    state.servingSide = server;

    // Initial Position (Attached to paddle)
    if (server === 'player') {
      state.ball.x = state.playerX + levelSettings.playerPaddleWidth / 2 - BALL_SIZE / 2;
      state.ball.y = GAME_HEIGHT - 30 - BALL_SIZE - 2;
      state.ball.dx = 0;
      state.ball.dy = 0;
    } else {
      state.ball.x = state.aiX + levelSettings.aiPaddleWidth / 2 - BALL_SIZE / 2;
      state.ball.y = 15 + PADDLE_HEIGHT + 2;
      state.ball.dx = 0;
      state.ball.dy = 0;

      // AI Serves (Wait for User Tap)

    }
    
    // Trigger visual update
    setBall({ ...state.ball });
  }, [levelSettings]);

  const startGame = useCallback(() => {
    setScores({ ai: 0, player: 0 });
    setGameResult(null);
    setIsPlaying(true);
    gameStateRef.current.isPlaying = true;
    resetBall('player'); // Player always serves first
  }, [resetBall]);

  // Input Handling
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => setActiveKeys(p => new Set(p).add(e.key));
    const onUp = (e: KeyboardEvent) => setActiveKeys(p => {
      const n = new Set(p); n.delete(e.key); return n; 
    });
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // -- Game Loop --
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const loop = setInterval(() => {
      if (!gameStateRef.current.isPlaying) {
        return;
      }

      const state = gameStateRef.current;
      const {
        aiPaddleWidth,
        aiSpeed,
        ballSpeed,
        goal,
        playerPaddleWidth,
      } = levelSettings;

      // 1. Handle Serving Logic
      if (state.servingSide === 'player') {
        // Follow Player Paddle
        state.ball.x = state.playerX + playerPaddleWidth / 2 - BALL_SIZE / 2;
        state.ball.y = GAME_HEIGHT - 30 - BALL_SIZE - 2;
      } else if (state.servingSide === 'ai') {
        // Follow AI Paddle
        state.ball.x = state.aiX + aiPaddleWidth / 2 - BALL_SIZE / 2;
        state.ball.y = 15 + PADDLE_HEIGHT + 2;
      }

      // 2. Move Player (Keys)
      if (activeKeys.has('ArrowLeft')) {
        setPlayerX(x => Math.max(0, x - 7));
      }
      if (activeKeys.has('ArrowRight')) {
        setPlayerX(x => Math.min(GAME_WIDTH - playerPaddleWidth, x + 7));
      }

      // 3. Move AI
      const centerVid = state.aiX + aiPaddleWidth / 2;
      // Target is ball X, or Center if Resetting?
      const targetX = state.servingSide === 'ai' ? GAME_WIDTH/2 : state.ball.x;
      
      if (centerVid < targetX - 5) {
        state.aiX = Math.min(GAME_WIDTH - aiPaddleWidth, state.aiX + aiSpeed);
      } else if (centerVid > targetX + 5) {
        state.aiX = Math.max(0, state.aiX - aiSpeed);
      }
      setAiX(state.aiX);

      // 4. Move Ball (Only if not serving)
      if (!state.servingSide) {
        state.ball.x += state.ball.dx;
        state.ball.y += state.ball.dy;

        // Walls (Left/Right)
        if (state.ball.x <= 0 || state.ball.x >= GAME_WIDTH - BALL_SIZE) {
          state.ball.dx *= -1;
        }

        // Paddles Collision
        const playerY = GAME_HEIGHT - 30; 
        const aiY = 15; 

        // Player Hit
        if (
          state.ball.y + BALL_SIZE >= playerY && 
            state.ball.y + BALL_SIZE <= playerY + PADDLE_HEIGHT &&
            state.ball.x + BALL_SIZE >= state.playerX &&
            state.ball.x <= state.playerX + playerPaddleWidth
        ) {
          state.ball.dy = -Math.abs(state.ball.dy);
          const hitPoint = (state.ball.x + BALL_SIZE/2) - (state.playerX + playerPaddleWidth/2);
          state.ball.dx = hitPoint * (ballSpeed/playerPaddleWidth); // Normalized spin
        }

        // AI Hit
        if (
          state.ball.y <= aiY + PADDLE_HEIGHT && 
            state.ball.y >= aiY &&
            state.ball.x + BALL_SIZE >= state.aiX &&
            state.ball.x <= state.aiX + aiPaddleWidth
        ) {
          state.ball.dy = Math.abs(state.ball.dy);
          const hitPoint = (state.ball.x + BALL_SIZE/2) - (state.aiX + aiPaddleWidth/2);
          state.ball.dx = hitPoint * (ballSpeed/aiPaddleWidth); 
        }

        // Scoring
        if (state.ball.y > GAME_HEIGHT) {
          // AI Point - AI Serves
          setScores(s => {
            const newState = { ...s, ai: s.ai + 1 };
            if (newState.ai >= goal) {
              setIsPlaying(false);
              state.isPlaying = false;
              setGameResult('lose');
              onFailure && onFailure({ message: 'You Lost to the Machine!' });
            } else {
              resetBall('ai');
            }
            return newState;
          });
        } else if (state.ball.y < -BALL_SIZE) {
          // Player Point - Player Serves
          setScores(s => {
            const newState = { ...s, player: s.player + 1 };
            if (newState.player >= goal) {
              setIsPlaying(false);
              state.isPlaying = false;
              setGameResult('win');
              onSuccess && onSuccess({ message: 'Victory!' });
            } else {
              resetBall('player');
            }
            return newState;
          });
        }
      }

      setBall({ ...state.ball });

    }, 16); // 60 FPS

    return () => clearInterval(loop);
  }, [isPlaying, activeKeys, levelSettings, resetBall, onFailure, onSuccess]);

  // Touch Drag Logic
  const areaRef = useRef<HTMLDivElement>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!areaRef.current || !isPlaying) {
      return;
    }
    const touch = e.touches[0];
    const rect = areaRef.current.getBoundingClientRect();
    const relX = touch.clientX - rect.left;
    const newX = Math.max(0, Math.min(GAME_WIDTH - levelSettings.playerPaddleWidth, relX - levelSettings.playerPaddleWidth / 2));
    setPlayerX(newX);
  };

  const handleServe = () => {
    const state = gameStateRef.current;
    if (state.servingSide) {
      const speed = levelSettings.ballSpeed;
      if (state.servingSide === 'player') {
        state.ball.dy = -speed;
      } else {
        state.ball.dy = speed;
      }
      state.ball.dx = (Math.random() > 0.5 ? 1 : -1) * (speed * 0.5);
      state.servingSide = null;
      setServingSide(null);
    }
  };

  return (
    <Container>
      {preview && (
        <PreviewControls>
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <Button 
              key={ d } 
              $active={ difficulty === d } 
              onClick={ () => {
                setDifficulty(d);
                onConfig && onConfig({ ...config, difficulty: d });
                setIsPlaying(false); 
                setScores({ ai: 0, player: 0 });
                setBall({
                  dx: 0, dy: 0, x: GAME_WIDTH/2, y: GAME_HEIGHT/2, 
                });
                setGameResult(null);
              } }>
              {d.toUpperCase()}
            </Button>
          ))}
        </PreviewControls>
      )}

      <Header>
        <div>
          PONG -
          {difficulty.toUpperCase()}
        </div>
        <div style={ {
          fontSize: '0.8rem', marginTop: 5, opacity: 0.7, 
        } }>
          FIRST TO 
          {' '}
          {levelSettings.goal}
          {' '}
          WINS
        </div>
      </Header>
      
      <GameArea 
        ref={ areaRef }
        onTouchMove={ handleTouchMove }
        onClick={ handleServe }>
        <Divider />
         
        <ScoreBoard>
          <div style={ {
            left: '80px', position: 'absolute', top: '-100px', transform: 'rotate(180deg)', 
          } }>
            {scores.ai}
          </div>
          <div style={ {
            left: '80px', position: 'absolute', top: '20px', 
          } }>
            {scores.player}
          </div>
        </ScoreBoard>

        {!isPlaying && !gameResult && (
          <Overlay>
            <div style={ {
              color: '#cc00ff', fontSize: '2rem', marginBottom: 20, textShadow: '0 0 10px #cc00ff', 
            } }>
              NEON PONG
            </div>
            <Button onClick={ startGame } $color="#cc00ff" $active>START</Button>
            <div style={ {
              fontSize: '0.9rem', marginTop: 15, opacity: 0.8, 
            } }>
              Drag or Arrows to Move. Tap to Serve.
            </div>
          </Overlay>
        )}

        {gameResult === 'lose' && (
          <Overlay>
            <div style={ {
              color: '#ff0055', fontSize: '2rem', marginBottom: 20, 
            } }>
              DEFEAT
            </div>
            <Button onClick={ startGame } $color="#ff0055">RETRY</Button>
          </Overlay>
        )}

        {gameResult === 'win' && (
          <Overlay>
            <div style={ {
              color: '#00f2ff', fontSize: '2rem', marginBottom: 20, 
            } }>
              VICTORY
            </div>
            <Button onClick={ startGame } $color="#00f2ff">PLAY AGAIN</Button>
          </Overlay>
        )}
         
        {/* Serve Prompt */}
        {(gameStateRef.current.servingSide === 'player' || gameStateRef.current.servingSide === 'ai') && isPlaying && (
          <div style={ {
            animation: 'pulse 1s infinite', bottom: 100, color: '#00f2ff', fontWeight: 'bold', position: 'absolute', textAlign: 'center', width: '100%', 
          } }>
            TAP TO SERVE
          </div>
        )}

        <Paddle $width={ levelSettings.aiPaddleWidth } $x={ aiX } $y={ 15 } />
        <Paddle $isPlayer $width={ levelSettings.playerPaddleWidth } $x={ playerX } $y={ GAME_HEIGHT - 30 } />
        <Ball $x={ ball.x } $y={ ball.y } />
      </GameArea>
      
      <Controls>
        <Button 
          style={ {
            borderRadius: '50%', height: 60, width: 60, 
          } }
          onMouseDown={ () => setActiveKeys(p => new Set(p).add('ArrowLeft')) }
          onMouseUp={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowLeft'); return n; 
          }) }
          onTouchStart={ () => setActiveKeys(p => new Set(p).add('ArrowLeft')) }
          onTouchEnd={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowLeft'); return n; 
          }) }>
          ◀
        </Button>

        {(servingSide === 'player' || servingSide === 'ai') && isPlaying ? (
          <Button 
            onClick={ handleServe }
            style={ {
              background: '#00f2ff', border: 'none', boxShadow: '0 0 10px #00f2ff', color: '#000', fontSize: '0.9rem', padding: '12px 20px', 
            } }>
            SERVE
          </Button>
        ) : (
          <Button 
            onClick={ () => {
              if (window.confirm('Quit Match?')) {
                setIsPlaying(false);
                setGameResult('lose'); 
                setScores({ ai: 0, player: 0 });
              }
            } }
            style={ {
              background: 'transparent', borderColor: 'transparent', fontSize: '0.8rem', opacity: 0.6, padding: '12px 20px', 
            } }>
            RESET
          </Button>
        )}

        <Button 
          style={ {
            borderRadius: '50%', height: 60, width: 60, 
          } }
          onMouseDown={ () => setActiveKeys(p => new Set(p).add('ArrowRight')) }
          onMouseUp={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowRight'); return n; 
          }) }
          onTouchStart={ () => setActiveKeys(p => new Set(p).add('ArrowRight')) }
          onTouchEnd={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowRight'); return n; 
          }) }>
          ▶
        </Button>
      </Controls>
    </Container>
  );
};