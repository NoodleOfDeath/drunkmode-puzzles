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
type Droid = { id: number; x: number; y: number };
type Bullet = { id: number; x: number; y: number };
type Difficulty = 'easy' | 'hard' | 'medium';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const SHIP_WIDTH = 30;
const SHIP_HEIGHT = 30;
const DROID_WIDTH = 25;
const DROID_HEIGHT = 25;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 10;

const LEVELS = {
  easy: {
    droidSpeed: 2, goal: 10, spawnRate: 1500, 
  },
  hard: {
    droidSpeed: 5, goal: 30, spawnRate: 800, 
  },
  medium: {
    droidSpeed: 3.5, goal: 20, spawnRate: 1000, 
  },
};

// -- STYLED COMPONENTS (Matched to Snake/WordSearch) --

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: #0b1026; /* Deep space blue */
  color: #fff;
  font-family: 'Anton', sans-serif;
  user-select: none;
  touch-action: none;
  height: 100%;
`;

const GameArea = styled.div`
  width: ${GAME_WIDTH}px;
  height: ${GAME_HEIGHT}px;
  background: radial-gradient(circle at bottom, #1b2735 0%, #090a0f 100%);
  border: 4px solid #00fff2; /* Neon Cyan */
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 242, 0.4);
  position: relative;
  overflow: hidden;
`;

const Ship = styled.div.attrs<{ $x: number }>(props => ({ style: { left: `${props.$x}px` } }))<{ $x: number }>`
  position: absolute;
  bottom: 20px;
  width: ${SHIP_WIDTH}px;
  height: ${SHIP_HEIGHT}px;
  background-color: #00fff2;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  box-shadow: 0 0 10px #00fff2;
`;

const Droid = styled.div.attrs<{ $x: number; $y: number }>(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
}))<{ $x: number; $y: number }>`
  position: absolute;
  width: ${DROID_WIDTH}px;
  height: ${DROID_HEIGHT}px;
  background-color: #ff0055; /* Neon Red */
  border-radius: 4px;
  box-shadow: 0 0 8px #ff0055;
  &::after {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 10px 0 0 #fff;
  }
`;

const Bullet = styled.div.attrs<{ $x: number; $y: number }>(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
}))<{ $x: number; $y: number }>`
  position: absolute;
  width: ${BULLET_WIDTH}px;
  height: ${BULLET_HEIGHT}px;
  background-color: #fffb00; /* Neon Yellow */
  border-radius: 2px;
  box-shadow: 0 0 5px #fffb00;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const Button = styled.button<{ $active?: boolean; $color?: string }>`
  background: ${props => props.$active ? '#00fff2' : (props.$color || '#333')};
  color: ${props => props.$active ? '#000' : 'white'};
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
    box-shadow: 0 0 15px ${props => props.$color || '#00fff2'};
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
  margin-top: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
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
  const [shipX, setShipX] = useState(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [droids, setDroids] = useState<Droid[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastShotTimeRef = useRef(0);
  const lastDroidTimeRef = useRef(0);
  const activeKeysRef = useRef<Set<string>>(new Set());

  // -- UNIFIED GAME LOOP --
  // We use refs for positions to avoid React render lag, state only for UI (score).
  const gameState = useRef({
    bullets: [] as Bullet[],
    droids: [] as Droid[],
    lastDroid: 0,
    lastShot: 0,
    playing: false,
    score: 0,
    shipX: GAME_WIDTH / 2 - SHIP_WIDTH / 2,
  });

  // Initialize
  const resetGame = useCallback(() => {
    setShipX(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
    setBullets([]);
    setDroids([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    lastDroidTimeRef.current = Date.now();
  }, []);

  // Input Handling
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const n = new Set(prev); n.add(e.key); 
        activeKeysRef.current = n;
        return n; 
      });
    };
    const onUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const n = new Set(prev); n.delete(e.key); 
        activeKeysRef.current = n;
        return n; 
      });
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Sync Difficulty
  useEffect(() => {
    if (config?.difficulty) {
      setDifficulty(config.difficulty as Difficulty);
    }
  }, [config?.difficulty]);

  // -- Game Loop --
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const state = gameState.current;
    state.playing = true;
    state.shipX = shipX; // Sync initial position
    state.score = score;
    state.bullets = [];
    state.droids = [];
    state.lastDroid = Date.now();
    state.lastShot = 0;

    const loop = setInterval(() => {
      const now = Date.now();
      const {
        droidSpeed, goal, spawnRate, 
      } = levelSettings;

      // 1. Move Ship (Keyboard)
      if (activeKeysRef.current.has('ArrowLeft')) {
        state.shipX = Math.max(0, state.shipX - 7);
      }
      if (activeKeysRef.current.has('ArrowRight')) {
        state.shipX = Math.min(GAME_WIDTH - SHIP_WIDTH, state.shipX + 7);
      }
      setShipX(state.shipX);

      // 2. Auto-Fire (Spacebar)
      if (activeKeysRef.current.has(' ')) {
        if (now - state.lastShot > 300) { 
          state.bullets.push({
            id: now, x: state.shipX + SHIP_WIDTH/2 - BULLET_WIDTH/2, y: GAME_HEIGHT - 60, 
          });
          state.lastShot = now;
        }
      }

      // 3. Spawn Droids
      if (now - state.lastDroid > spawnRate) {
        state.droids.push({ 
          id: now, 
          x: Math.floor(Math.random() * (GAME_WIDTH - DROID_WIDTH)), 
          y: -DROID_HEIGHT, 
        });
        state.lastDroid = now;
      }

      // 4. Move Bullets
      state.bullets = state.bullets
        .map(b => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter(b => b.y > -BULLET_HEIGHT);

      // 5. Move Droids
      const nextDroids: Droid[] = [];
      let playerHit = false;
      state.droids.forEach(d => {
        const newY = d.y + droidSpeed;
        if (
          newY + DROID_HEIGHT >= GAME_HEIGHT - 60 && 
           newY <= GAME_HEIGHT - 20 &&
           d.x < state.shipX + SHIP_WIDTH &&
           d.x + DROID_WIDTH > state.shipX
        ) {
          playerHit = true;
        } else if (newY < GAME_HEIGHT) {
          nextDroids.push({ ...d, y: newY });
        }
      });
      state.droids = nextDroids;

      if (playerHit) {
        handleGameOver();
        clearInterval(loop);
        return;
      }

      // 6. Bullet-Droid Collision
      const survivingBullets: Bullet[] = [];
      let scoreIncrement = 0;
      const hitDroids = new Set<number>();

      state.bullets.forEach(b => {
        let hit = false;
        // Check against all droids
        state.droids.forEach(d => {
          if (hit) {
            return; // Bullet already hit something
          }
          if (hitDroids.has(d.id)) {
            return; // Droid already dead
          }
          if (
            b.x < d.x + DROID_WIDTH &&
            b.x + BULLET_WIDTH > d.x &&
            b.y < d.y + DROID_HEIGHT &&
            b.y + BULLET_HEIGHT > d.y
          ) {
            hit = true;
            hitDroids.add(d.id);
            scoreIncrement++;
          }
        });
        
        if (!hit) {
          survivingBullets.push(b);
        }
      });

      state.bullets = survivingBullets;
      // Filter out dead droids
      if (scoreIncrement > 0) {
        state.droids = state.droids.filter(d => !hitDroids.has(d.id));
        state.score += scoreIncrement;
        setScore(state.score);
        
        if (state.score >= goal) {
          handleWin();
          clearInterval(loop);
          return;
        }
      }

      // Sync React State for Rendering
      setBullets([...state.bullets]);
      setDroids([...state.droids]);
      
    }, 30); // ~30 FPS

    return () => clearInterval(loop);
  }, [isPlaying, levelSettings]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    onFailure && onFailure({ message: 'Shields Failed! Mission Failed.' });
  };

  const handleWin = () => {
    setIsPlaying(false);
    onSuccess && onSuccess({ message: `Sector Clear! Targets Destroyed: ${levelSettings.goal}` });
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
                setScore(0);
                setBullets([]);
                setDroids([]); // Visual reset
              } }>
              {d.toUpperCase()}
            </Button>
          ))}
        </PreviewControls>
      )}

      <Header>
        SCORE:
        {score}
        {' '}
        /
        {levelSettings.goal}
      </Header>
      
      <GameArea>
        {!isPlaying && !gameOver && (
          <Overlay>
            <div style={ {
              color: '#00fff2', fontSize: '2rem', marginBottom: 20, textShadow: '0 0 10px #00fff2', 
            } }>
              SPACE BLASTER
            </div>
            <Button onClick={ resetGame } $color="#00fff2" $active>START MISSION</Button>
            <div style={ {
              fontSize: '0.9rem', marginTop: 15, opacity: 0.8, 
            } }>
              Use Arrows to Move • Space to Fire
            </div>
          </Overlay>
        )}

        {gameOver && (
          <Overlay>
            <div style={ {
              color: '#ff0055', fontSize: '2rem', marginBottom: 20, 
            } }>
              MISSION FAILED
            </div>
            <Button onClick={ resetGame } $color="#ff0055">RETRY</Button>
          </Overlay>
        )}

        {/* Entities */}
        <Ship $x={ shipX } />
        {droids.map(d => <Droid key={ d.id } $x={ d.x } $y={ d.y } />)}
        {bullets.map(b => <Bullet key={ b.id } $x={ b.x } $y={ b.y } />)}
      </GameArea>

      <Controls>
        <Button 
          onMouseDown={ () => setActiveKeys(p => {
            const n = new Set(p).add('ArrowLeft'); activeKeysRef.current = n; return n; 
          }) }
          onMouseUp={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowLeft'); activeKeysRef.current = n; return n; 
          }) }
          onTouchStart={ () => setActiveKeys(p => {
            const n = new Set(p).add('ArrowLeft'); activeKeysRef.current = n; return n; 
          }) }
          onTouchEnd={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowLeft'); activeKeysRef.current = n; return n; 
          }) }>
          ◀
        </Button>
         
        <Button 
          style={ {
            backgroundColor: '#ff0055', border: 'none', color: 'white', width: 80, 
          } }
          onMouseDown={ () => setActiveKeys(p => {
            const n = new Set(p).add(' '); activeKeysRef.current = n; return n; 
          }) }
          onMouseUp={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete(' '); activeKeysRef.current = n; return n; 
          }) }
          onTouchStart={ () => setActiveKeys(p => {
            const n = new Set(p).add(' '); activeKeysRef.current = n; return n; 
          }) }
          onTouchEnd={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete(' '); activeKeysRef.current = n; return n; 
          }) }>
          FIRE
        </Button>

        <Button 
          onMouseDown={ () => setActiveKeys(p => {
            const n = new Set(p).add('ArrowRight'); activeKeysRef.current = n; return n; 
          }) }
          onMouseUp={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowRight'); activeKeysRef.current = n; return n; 
          }) }
          onTouchStart={ () => setActiveKeys(p => {
            const n = new Set(p).add('ArrowRight'); activeKeysRef.current = n; return n; 
          }) }
          onTouchEnd={ () => setActiveKeys(p => {
            const n = new Set(p); n.delete('ArrowRight'); activeKeysRef.current = n; return n; 
          }) }>
          ▶
        </Button>
      </Controls>
      
      <div style={ { marginTop: 20 } }>
        <Button 
          onClick={ () => {
            if (window.confirm('Abort Mission?')) {
              setIsPlaying(false);
              setGameOver(true); // Technically a loss
              resetGame();
              setIsPlaying(false); // Stay on menu
            }
          } }
          style={ {
            fontSize: '0.8rem', opacity: 0.6, padding: '8px 16px', 
          } }>
          RESET
        </Button>
      </div>

    </Container>
  );
};