// SolitairePuzzle.tsx
import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import { DragDropContext } from 'react-beautiful-dnd';

import Foundation from './components/Foundation';
import {
  checkWinningCondition,
  handleDragEnd,
  moveCardsAfterWin,
} from './components/Logic';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';

export const SUITS = {
  club: '♣',
  diamond: '♦',
  heart: '♥',
  spade: '♠',
} as const;

export const SUIT_IMAGES = {
  club: './club.png',
  diamond: './diamond.png',
  heart: './heart.png',
  spade: './spade.png',
} as const;

export type Suit = keyof typeof SUITS;

// Define card suits and ranks
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Rank = typeof RANKS[number];

export type CardProps = {
  id: `${Suit}${Rank}`;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
  red: boolean;
};

// Generate all 52 cards
const DECK: CardProps[] = [];
for (const suit of Object.keys(SUITS) as Suit[]) {
  for (const rank of RANKS) {
    DECK.push({
      id: `${suit}${rank}`,
      isFaceUp: true,
      rank,
      red: suit === 'heart' || suit === 'diamond',
      suit,
    });
  }
}

export type HistoryState = {
  flippedCards: CardProps[];
  stockCards: CardProps[];
  suitCards: CardProps[][];
  tableauCards: CardProps[][];
  wasteCards: CardProps[];
};

export const ZERO_STATE: HistoryState = {
  flippedCards: [],
  stockCards: [],
  suitCards: [[], [], [], []],
  tableauCards: [],
  wasteCards: [],
};

export const Puzzle = ({
  startFresh,
  //config,
  data,
  //onConfig,
  onProgress,
  onMistake,
  // onFailure,
  onSuccess,
  ...props
}: PuzzleProps) => {
  
  const [loaded, setLoaded] = React.useState(false);
  const [state, setState] = React.useState(ZERO_STATE);
  const [_, setGameHistory] = React.useState<HistoryState[]>([]);
  
  const setCards = React.useCallback(() => {
    const shuffledCards = [...DECK].sort(() => Math.random() - 0.5);
    setState((prev) => {
      const cards: CardProps[][] = [];
      let currentIndex = 0;
      for (let i = 1; i <= 7; i++) {
        const column = [];
        for (let j = 0; j < i; j++) {
          if (j + 1 == i) {
            shuffledCards.slice(0, 28)[currentIndex + j].isFaceUp = true;
          } else {
            shuffledCards.slice(0, 28)[currentIndex + j].isFaceUp = false;
          }
          column.push(shuffledCards.slice(0, 28)[currentIndex + j]);
        }
        cards.push(column);
        currentIndex += i;
      }
      return {
        ...prev,
        stockCards: shuffledCards.slice(28),
        tableauCards: cards,
      };
    });
  }, []);
  
  React.useEffect(() => {
    if (data && !startFresh && !loaded) {
      try {
        const { state, history } = (typeof data === 'string' ? JSON.parse(data) : data) as { state: HistoryState; history: HistoryState[]; };
        if (history.length > 0) {
          setState(state);
          setGameHistory(history);
        } else {
          throw new Error('Error loading history');
        }
      } catch (e) {
        alert('there was an issue loading puzzle progress');
        setCards();
      } finally {
        setLoaded(true);
      }
    } else {
      setCards();
    }
  }, [startFresh, data, loaded, setCards]);
  
  const undoMove = React.useCallback(() => {
    if (!loaded) {
      return;
    }
    setGameHistory((prev) => {
      if (prev.length > 0) {
        // contains flipped card state ( dt )
        const dt = prev[prev.length - 1];
        // contains last history state (dt minus 1)
        const dt_1 = prev.length > 1 ? prev[prev.length - 2] : dt;
        for (const column of dt_1.tableauCards) {
          for (const card of column) {
            if (dt.flippedCards.some((c) => c.id === card.id)) {
              // force previously face-down cards back to face-down
              card.isFaceUp = false;
            }
          }
        }
        setState(dt_1);
        return prev.slice(0, -1);
      }
      return prev;
    });
  }, [loaded]);
  
  const resetGame = () => {
    const reset = confirm('Are you sure you want to start a new game? All progress will be lost and cannot be done');
    if (!reset) {
      return;
    }
    setGameHistory([]);
    setState(ZERO_STATE);
    setCards();
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEndWrapper = React.useCallback(({ source, destination }: { source: any; destination: any; }) => {
    
    const {
      failure,
      ...dtState
    } = handleDragEnd({
      destination,
      source,
      ...state,
    });

    if (failure) {
      onMistake?.();
      return;
    }

    const newState: HistoryState = {
      stockCards: state.stockCards, 
      ...dtState,
    };
    
    setGameHistory((prev) => {
      const isWinner = checkWinningCondition(dtState.tableauCards, dtState.wasteCards, state.stockCards);
      if (isWinner && prev.length > 2) {
        moveCardsAfterWin({
          setSuitCards: (suitCards) => setState({ ...newState, suitCards: suitCards as CardProps[][] }),
          setTableauCards: (tableauCards) => setState({ ...newState, tableauCards: tableauCards as CardProps[][] }),
          ...dtState,
        });
        onSuccess();
      }
      const finalState = [...(prev ?? []), newState];
      onProgress?.(JSON.stringify({
        history: finalState,
        state: newState,
      }));
      return finalState;
    });

    setState(newState);
    
  }, [onMistake, onProgress, onSuccess, state]);
  
  return (
    <div
      className="flex flex-col px-2 w-full max-w-screen-lg mx-auto min-h-screen justify-center overscroll-none select-none"
      style={ { flexGrow: 1 } }>
      {props.preview && (
        <React.Fragment>
        </React.Fragment>
      )}
      {/* Foundation component */}
      <DragDropContext onDragEnd={ handleDragEndWrapper }>
        <div className='flex justify-between'>
          <StockPile 
            cards={ state.stockCards }
            wasteCards={ state.wasteCards }
            onDrawCard={ () => {
              setState((prev) => {
                if (prev.stockCards.length > 0) {
                  const lastCard = prev.stockCards[prev.stockCards.length - 1]; 
                  lastCard.isFaceUp = true;
                  return {
                    ...prev,
                    stockCards: prev.stockCards.slice(0, -1),
                    wasteCards: [...prev.wasteCards, lastCard],
                  };
                } else {
                  const resetWasteCards = prev.wasteCards.map(card => ({ ...card, isFaceUp: false }));
                  return {
                    ...prev,
                    stockCards: resetWasteCards.reverse(),
                    wasteCards: [],
                  };
                }
              });
            } } />
          <Foundation 
            suits={ Object.values(SUIT_IMAGES) }
            suitCards={ state.suitCards } /> 
        </div>
        <Tableau tableauCards={ state.tableauCards } />
      </DragDropContext>
      <div className="flex justify-center gap-6 mb-24">
        <button 
          className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60'
          onClick={ undoMove }>
          UNDO
        </button>
        <button
          className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60'
          onClick={ resetGame }>
          NEW
        </button>
      </div>
    </div>
  );
};

