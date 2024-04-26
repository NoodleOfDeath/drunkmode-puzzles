// SolitairePuzzle.tsx
import React, { useEffect, useState } from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import router from 'next/router';
import { DragDropContext } from 'react-beautiful-dnd';

import Foundation from './components/Foundation';
import { checkWinningCondition, handleDragEnd } from './components/Logic';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';
export type CardType = {
  id: string, isFaceUp: boolean; rank: string; red: boolean; suit: string;
};

// Define card suits and ranks
export const [suits, ranks] = [['♠', '♣', '♥', '♦'], ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']];

// Generate all 52 cards
const cards: CardType[] = [];
let cardId = 1;
for (const suit of suits) {
  for (const rank of ranks) {
    cards.push({
      id: `${cardId++}`,
      isFaceUp: true,
      rank,
      red: suit === '♥' || suit === '♦',
      suit,
    });
  }
}

export const Puzzle = ({
  // config,
  // data,
  // onConfig,
  // onProgress,
  // onFailure,
  onSuccess,
  ...props
}: PuzzleProps) => {
  const shuffledragCards = [...cards].sort(() => Math.random() - 0.5);
  const [tableauCards, setTableauCards] = useState<CardType[][]>([]);
  const [wasteCards, setWasteCards] = useState<CardType[]>([]); 
  const [stockCards, setStockCards] = useState<CardType[]>([]);
  const [suitCards, setsuitCards] = useState<Array<CardType[]>>([[], [], [], []]);
  const gameHistory = React.useRef<Array<any| undefined>>([]);
  useEffect(() => {
    setTableauCards(() => {
      const _cards: CardType[][] = [];
      let currentIndex = 0;
      for (let i = 1; i <= 7; i++) {
        const column = [];
        for (let j = 0; j < i; j++) {
          if (j+1 == i) {
            shuffledragCards.slice(0, 28)[currentIndex + j].isFaceUp = true;
          } else {
            shuffledragCards.slice(0, 28)[currentIndex + j].isFaceUp = false;
          }
          column.push(shuffledragCards.slice(0, 28)[currentIndex + j]);
        }
        _cards.push(column);
        currentIndex += i;
      }
      return _cards;
    }); 
    setStockCards(shuffledragCards.slice(28));
  }, []);

  useEffect(() => {
    const newStates = [tableauCards, wasteCards, stockCards, suitCards];
    gameHistory.current = [...gameHistory.current, newStates];
    console.log(gameHistory.current);
  }, [tableauCards, wasteCards, stockCards, suitCards]);
  const undoMove = () => {
    if (gameHistory.current.length > 2) {
      const prev = gameHistory.current[gameHistory.current.length - 2];
      setTableauCards(prev[0]);
      setWasteCards(prev[1]);
      setStockCards(prev[2]);
      setsuitCards(prev[3]);
      gameHistory.current.slice(0, -2);
    }
  };
  const handleDragEndWrapper = ({ source, destination }: { source: any; destination: any; }) => {
    handleDragEnd({
      destination,
      setTableauCards,
      setWasteCards,
      setsuitCards,
      source,
      stockCards,
      suitCards,
      tableauCards,
      wasteCards,
    });
    const isWinner = checkWinningCondition(tableauCards, wasteCards, stockCards);
    if (isWinner) {
      // TODO: move the reset of the tableau cards to the foundation with an animation
      onSuccess();
    }
  };

  const restart = () => {
    router.reload();
  };
  return (
    <div className="flex flex-col px-2 w-full max-w-screen-lg mx-auto min-h-screen">
      {props.preview && (
        <React.Fragment>
        </React.Fragment>
      )}
      {/* Foundation component */}
      <DragDropContext onDragEnd={ handleDragEndWrapper }>
        <div className='flex justify-between'>
          <StockPile cards={ stockCards } wasteCards={ wasteCards } setWasteCards={ setWasteCards } setStockCards={ setStockCards } />
          <Foundation suits={ suits } suitCards={ suitCards } setsuitCards={ setsuitCards } /> 
        </div>
        <Tableau tableauCards={ tableauCards } />
      </DragDropContext>
      <div className="flex justify-center gap-6 mb-2">
        <button className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60' onClick={ undoMove }>
          UNDO
        </button>
        <button className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60' onClick={ restart }>
          NEW
        </button>
      </div>
    </div>
  );
};

