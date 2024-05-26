// SolitairePuzzle.tsx
import React from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import { DragDropContext } from 'react-beautiful-dnd';

import club from './assets/club.png';
import diamond from './assets/diamond.png';
import heart from './assets/heart.png';
import spade from './assets/spade.png';
import Foundation from './components/Foundation';
import {
  checkWinningCondition,
  handleDragEnd,
  moveCardsAfterWin,
} from './components/Logic';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';

export const SUITS = {
  club,
  diamond,
  heart,
  spade,
} as const;

export type Suit = keyof typeof SUITS;

// Define card suits and ranks
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Rank = typeof RANKS[number];

export type CardType = {
  id: `${Suit}${Rank}`;
  isFaceUp: boolean; 
  rank: Rank;
  red: boolean; 
  suitName: Suit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suit: any;
};

// Generate all 52 cards
const DECK: CardType[] = [];
for (const [suitName, suit] of Object.entries(SUITS)) {
  for (const rank of RANKS) {
    DECK.push({
      id: `${suitName as Suit}${rank}`,
      isFaceUp: true,
      rank,
      red: suitName === 'heart' || suitName === 'diamond',
      suit,
      suitName: suitName as Suit,
    });
  }
}

export type HistoryState = {
  flippedCards: CardType[];
  stockCards: CardType[];
  suitCards: CardType[][];
  tableauCards: CardType[][];
  wasteCards: CardType[];
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
  const [tableauCards, setTableauCards] = React.useState<CardType[][]>([]);
  const [wasteCards, setWasteCards] = React.useState<CardType[]>([]); 
  const [stockCards, setStockCards] = React.useState<CardType[]>([]);
  const [suitCards, setSuitCards] = React.useState<CardType[][]>([[], [], [], []]);
  const [_, setGameHistory] = React.useState<HistoryState[]>([]);
  
  const setCards = React.useCallback(() => {
    const shuffledCards = [...DECK].sort(() => Math.random() - 0.5);
    setTableauCards(() => {
      const cards: CardType[][] = [];
      let currentIndex = 0;
      for (let i = 1; i <= 7; i++) {
        const column = [];
        for (let j = 0; j < i; j++) {
          if (j+1 == i) {
            shuffledCards.slice(0, 28)[currentIndex + j].isFaceUp = true;
          } else {
            shuffledCards.slice(0, 28)[currentIndex + j].isFaceUp = false;
          }
          column.push(shuffledCards.slice(0, 28)[currentIndex + j]);
        }
        cards.push(column);
        currentIndex += i;
      }
      return cards;
    }); 
    setStockCards(shuffledCards.slice(28));
  }, []);
  
  React.useEffect(() => {
    if (loaded) {
      return;
    }
    setLoaded(true);
    if (data && !startFresh) {
      try {
        const history = typeof data === 'string' ? JSON.parse(data) : data;
        setGameHistory(history);
      } catch (e) {
        alert('there was an issue loading puzzle progress');
        setCards();
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
      if (prev.length > 1) {
        const curr = prev[prev.length - 1];
        const old = prev[prev.length - 2];
        for (const column of old.tableauCards) {
          for (const card of column) {
            if (curr.flippedCards.some((c) => c.id === card.id)) {
              card.isFaceUp = false;
            }
          }
        }
        setTableauCards(old.tableauCards);
        setWasteCards(old.wasteCards);
        setStockCards(old.stockCards);
        setSuitCards(old.suitCards);
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
    setTableauCards([]);
    setWasteCards([]);
    setStockCards([]);
    setSuitCards([[], [], [], []]);
    setCards();
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEndWrapper = React.useCallback(({ source, destination }: { source: any; destination: any; }) => {
    
    const {
      failure,
      uFlipped, 
      uTableau, 
      uSuit,
      uWaste, 
    } = handleDragEnd({
      destination,
      source,
      suitCards,
      tableauCards,
      wasteCards,
    });

    if (failure) {
      onMistake?.();
      return;
    }

    const newStates: HistoryState = {
      flippedCards: uFlipped,
      stockCards, 
      suitCards: uSuit, 
      tableauCards: uTableau, 
      wasteCards: uWaste,
    };
    
    setGameHistory((prev) => {
      const isWinner = checkWinningCondition(uTableau, uWaste, stockCards);
      if (isWinner && prev.length > 2) {
        moveCardsAfterWin({
          setSuitCards, 
          setTableauCards, 
          suitCards: uSuit,
          tableauCards: uTableau,
        });
        onSuccess();
      }
      const state = [...(prev ?? []), newStates];
      onProgress?.(JSON.stringify(state));
      return state;
    });

    setTableauCards(uTableau);
    setSuitCards(uSuit);
    setWasteCards(uWaste);
    
  }, [onMistake, onProgress, onSuccess, stockCards, suitCards, tableauCards, wasteCards]);
  
  return (
    <div className="flex flex-col px-2 w-full max-w-screen-lg mx-auto max-h-screen justify-center overscroll-none select-none">
      {props.preview && (
        <React.Fragment>
        </React.Fragment>
      )}
      {/* Foundation component */}
      <DragDropContext onDragEnd={ handleDragEndWrapper }>
        <div className='flex justify-between'>
          <StockPile 
            cards={ stockCards }
            wasteCards={ wasteCards }
            onDrawCard={ () => {
              setStockCards((prev) => {
                if (prev.length > 0) {
                  const lastCard = prev[prev.length - 1]; 
                  lastCard.isFaceUp = true;
                  setWasteCards((prev) => [...prev, lastCard]);
                  return prev.slice(0, -1);
                } else {
                  const resetWasteCards = wasteCards.map(card => ({ ...card, isFaceUp: false }));
                  setWasteCards([]); 
                  return resetWasteCards.reverse();
                }
              });
            } } />
          <Foundation 
            suits={ Object.values(SUITS) }
            suitCards={ suitCards }
            setSuitCards={ setSuitCards } /> 
        </div>
        <Tableau tableauCards={ tableauCards } />
      </DragDropContext>
      <div className="grow h-24" />
      <div className="flex justify-center gap-6 mb-2">
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

