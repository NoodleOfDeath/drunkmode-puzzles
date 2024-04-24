// SolitairePuzzle.tsx
import React, { useEffect, useState } from 'react';

import { PuzzleProps } from 'drunkmode-puzzles';
import { DragDropContext } from 'react-beautiful-dnd';

import Foundation from './components/Foundation';
import StockPile from './components/Stock';
import Tableau from './components/Tableau';

export type CardType = {
  id: string, isFaceUp: boolean; rank: string; red: boolean; suit: string;
};

// Define card suits and ranks
const [suits, ranks] = [['♠', '♣', '♥', '♦'], ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']];

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
  // onSuccess,
  ...props
}: PuzzleProps) => {
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
  const [tableauCards, setTableauCards] = useState<CardType[][]>([]);
  const [wasteCards, setWasteCards] = useState<CardType[]>([]);
  const [suitCards, setsuitCards] = useState<Array<CardType[]>>([[], [], [], []]);
  useEffect(() => {
    setTableauCards(() => {
      const _cards: CardType[][] = [];
      let currentIndex = 0;
      for (let i = 1; i <= 7; i++) {
        const column = [];
        for (let j = 0; j < i; j++) {
          column.push(shuffledCards.slice(0, 28)[currentIndex + j]);
        }
        _cards.push(column);
        currentIndex += i;
      }
      return _cards;
    }); 
  }, []);

  // check if it's a valid move
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) {
      console.log('Oops');
      return;
    }

    const sourceIdParts = source.droppableId.split('-');
    const destinationIdParts = destination.droppableId.split('-');

    // If dragging from tableau column
    if (sourceIdParts[0] === 'col') {
      
      const sourceColumnIndex = parseInt(sourceIdParts[1]);
      const destinationColumnIndex = parseInt(destinationIdParts[1]);
      const sourceCardIndex = source.index;
      const destinationCardIndex = destination.index;
      if (destinationIdParts[0] === 'col') {
        if (sourceColumnIndex === destinationColumnIndex) {
          return;
        }
        const updatedTableauCards = [...tableauCards];
        const [draggedCard] = updatedTableauCards[sourceColumnIndex].splice(sourceCardIndex, 1);
        updatedTableauCards[destinationColumnIndex].splice(destinationCardIndex, 0, draggedCard);
        setTableauCards(updatedTableauCards);
      } else if (destinationIdParts[0] === 'suit') {
        const updatedSuitCards = [...suitCards];
        const updatedTableauCards = [...tableauCards];
        const [draggedCard] = updatedTableauCards[sourceColumnIndex].splice(sourceCardIndex, 1);
        updatedSuitCards[parseInt(destinationIdParts[1])].push(draggedCard);
        setsuitCards(updatedSuitCards);
        
        updatedTableauCards[destinationColumnIndex].splice(destinationCardIndex, 0);
        setTableauCards(updatedTableauCards);
        
      }
    } else if (sourceIdParts[0] === 'waste') {
      // If dragging from waste pile
      const destinationIdParts = destination.droppableId.split('-');
      const destinationColumnIndex = parseInt(destinationIdParts[1]);
      const destinationCardIndex = destination.index;
      const updatedTableauCards = [...tableauCards];
      const [draggedCard] = wasteCards.splice(-1); 
      if (destinationIdParts[0] === 'col') {
        updatedTableauCards[destinationColumnIndex].splice(destinationCardIndex, 0, draggedCard);
        setTableauCards(updatedTableauCards);
      } else if (destinationIdParts[0] === 'suit') {
        const updatedSuitCards = [...suitCards];
        updatedSuitCards[parseInt(destinationIdParts[1])].push(draggedCard);
        setsuitCards(updatedSuitCards);
      }
      setWasteCards(wasteCards);
    } else if (sourceIdParts[0] === 'suit') {
      const sourceSuitIndex = parseInt(sourceIdParts[1]);
      const destinationColumnIndex = parseInt(destinationIdParts[1]);
      const sourceCardIndex = source.index;
      const draggedCard = suitCards[sourceSuitIndex][sourceCardIndex];

      if (destinationIdParts[0] === 'col') {
        const updatedSuitCards = [...suitCards];
        updatedSuitCards[sourceSuitIndex].splice(sourceCardIndex, 1);
        setsuitCards(updatedSuitCards);
        const updatedTableauCards = [...tableauCards];
        updatedTableauCards[destinationColumnIndex].push(draggedCard);
        setTableauCards(updatedTableauCards);
      }
    }
  };
  return (
    <div className="flex flex-col px-2 w-full max-w-screen-lg mx-auto min-h-screen">
      {props.preview && (
        <React.Fragment>
        </React.Fragment>
      )}
      {/* Foundation component */}
      <DragDropContext onDragEnd={ handleDragEnd }>
        <div className='flex justify-between'>
          <StockPile cards={ shuffledCards.slice(28) } wasteCards={ wasteCards } setWasteCards={ setWasteCards } />
          <Foundation suits={ suits } suitCards={ suitCards } setsuitCards={ setsuitCards } /> 
        </div>
        <Tableau tableauCards={ tableauCards } />
      </DragDropContext>
    </div>
  );
};

