// SolitairePuzzle.tsx
import React, { useEffect, useState } from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import { DragDropContext } from 'react-beautiful-dnd';

import Foundation from './components/Foundation';
import { checkWinningCondition, handleDragEnd } from './components/Logic';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';
export type CardType = {
  id: string, isFaceUp: boolean; rank: string; red: boolean; suit: string;
};

// Define card suits and ranks
export const [suits, ranks] = [['\u2660', '\u2663', '\u2665', '\u2666'], ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']];

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
  const [tableauCards, setTableauCards] = useState<CardType[][]>([]);
  const [wasteCards, setWasteCards] = useState<CardType[]>([]); 
  const [stockCards, setStockCards] = useState<CardType[]>([]);
  const [suitCards, setSuitCards] = useState<Array<CardType[]>>([[], [], [], []]);
  const [gameHistory, setGameHistory] = useState<Array<any[]>>([]);
  const setCards = () => {
    const shuffledragCards = [...cards].sort(() => Math.random() - 0.5);
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
  };
  useEffect(() => {
    setCards();
  }, []);

  useEffect(() => {
    const newStates = [tableauCards, wasteCards, stockCards, suitCards];
    setGameHistory([...gameHistory, newStates]);

    const isWinner = checkWinningCondition(tableauCards, wasteCards, stockCards);
    if (isWinner && gameHistory.length > 2) {
      console.log('winner!');

      // TODO: move the reset of the tableau cards to the foundation with an animation
      onSuccess();
    }
  }, [tableauCards, wasteCards, stockCards, suitCards]);
  const undoMove = () => {
    if (gameHistory.length > 2) {
      const prev = gameHistory[gameHistory.length - 2];
      setTableauCards(prev[0]);
      setWasteCards(prev[1]);
      setStockCards(prev[2]);
      setSuitCards(prev[3]);
      setGameHistory(gameHistory.slice(0, -2));
    }
  };
  const resetGame = () => {
    setGameHistory([]);
    setTableauCards([]);
    setWasteCards([]);
    setStockCards([]);
    setSuitCards([[], [], [], []]);
    setCards();
  };
  const handleDragEndWrapper = ({ source, destination }: { source: any; destination: any; }) => {
    handleDragEnd({
      destination,
      setSuitCards,
      setTableauCards,
      setWasteCards,
      source,
      suitCards,
      tableauCards,
      wasteCards,
    });
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
          <Foundation suits={ suits } suitCards={ suitCards } setSuitCards={ setSuitCards } /> 
        </div>
        <Tableau tableauCards={ tableauCards } />
      </DragDropContext>
      <div className="flex justify-center gap-6 mb-2">
        <button className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60' onClick={ undoMove }>
          UNDO
        </button>
        <button className='px-3 py-2 rounded-sm duration-300 cursor-pointer hover:bg-red-700/60' onClick={ resetGame }>
          NEW
        </button>
      </div>
    </div>
  );
};

