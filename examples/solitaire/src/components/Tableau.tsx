import React from 'react';

import Card from './Card';

import { CardType } from '~/SolitairePuzzle';

interface TableauProps {
  cards: CardType[]
}

const Tableau: React.FC<TableauProps> = ({ cards }) => {
  const tableauCards = [];
  let currentIndex = 0;
  for (let i = 1; i <= 7; i++) {
    const column = [];
    for (let j = 0; j < i; j++) {
      column.push(cards[currentIndex + j]);
    }
    tableauCards.push(column);
    currentIndex += i;
  }
  return (
    
    <div className="grid w-full grid-cols-7 justify-items-center">
      {tableauCards.map((column, columnIndex) => (
        <div style={ { height: `${(column.length - 1) * 20 + 150}px` } } key={ columnIndex }>
          {column.map((card, cardIndex) => {
            const isLastCard = cardIndex === column.length - 1;
            return (
              <div
                key={ cardIndex }
                style={ { transform: `translateY(${cardIndex * -75}%)` } }>
                <Card { ...card } isFaceUp={ isLastCard } />
              </div>
            );
          })} 
        </div>
      ))}
    </div>
  );
};

export default Tableau;
